package com.mirim.backend.service;

import com.mirim.backend.DTO.translate_DTO;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.client.JdkClientHttpRequestFactory;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestClientResponseException;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.web.server.ResponseStatusException;
import tools.jackson.databind.JsonNode;

import java.net.http.HttpClient;
import java.time.Duration;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.Map;

@Service
public class Translation_Service {

    private static final int MAX_TEXTS = 100;
    private static final int MAX_TEXT_LENGTH = 10_000;
    private static final int MAX_TOTAL_CHARACTERS = 100_000;
    private static final int MAX_BATCH_TEXTS = 50;
    private static final int MAX_BATCH_CHARACTERS = 8_000;

    private final RestClient restClient;
    private final String apiKey;
    private final String apiUrl;

    public Translation_Service(@Value("${deepl.api-key:}") String apiKey,
                              @Value("${deepl.api-url:https://api-free.deepl.com}") String apiUrl) {
        this.apiKey = apiKey;
        this.apiUrl = apiUrl.endsWith("/")
                ? apiUrl.substring(0, apiUrl.length() - 1)
                : apiUrl;
        JdkClientHttpRequestFactory requestFactory = new JdkClientHttpRequestFactory(
                HttpClient.newBuilder().connectTimeout(Duration.ofSeconds(5)).build());
        requestFactory.setReadTimeout(Duration.ofSeconds(15));
        this.restClient = RestClient.builder()
                .requestFactory(requestFactory)
                .build();
    }

    public Map<String, Object> translate(translate_DTO request) {
        if (request == null || request.texts() == null || request.targetLanguage() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "번역 요청이 올바르지 않습니다");
        }
        String targetLanguage = switch (request.targetLanguage().toLowerCase(Locale.ROOT)) {
            case "ja" -> "JA";
            case "ko" -> "KO";
            default -> throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "지원하지 않는 번역 언어입니다");
        };
        if (request.texts().size() > MAX_TEXTS) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "번역할 항목이 너무 많습니다");
        }
        if (apiKey.isBlank()) {
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "번역 서비스가 설정되지 않았습니다");
        }

        List<String> translations = new ArrayList<>(request.texts());
        List<Integer> batchIndexes = new ArrayList<>();
        List<String> batchTexts = new ArrayList<>();
        int totalCharacters = 0;
        int batchCharacters = 0;

        for (int i = 0; i < request.texts().size(); i++) {
            String text = request.texts().get(i);
            if (text == null || text.length() > MAX_TEXT_LENGTH) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "번역할 문장이 올바르지 않습니다");
            }
            totalCharacters += text.length();
            if (totalCharacters > MAX_TOTAL_CHARACTERS) {
                throw new ResponseStatusException(HttpStatus.CONTENT_TOO_LARGE, "번역할 내용이 너무 깁니다");
            }
            if (text.isBlank()) {
                continue;
            }
            if (!batchTexts.isEmpty()
                    && (batchTexts.size() >= MAX_BATCH_TEXTS
                    || text.length() + batchCharacters > MAX_BATCH_CHARACTERS)) {
                appendTranslatedBatch(batchTexts, batchIndexes, translations, targetLanguage);
                batchTexts.clear();
                batchIndexes.clear();
                batchCharacters = 0;
            }
            batchTexts.add(text);
            batchIndexes.add(i);
            batchCharacters += text.length();
        }
        if (!batchTexts.isEmpty()) {
            appendTranslatedBatch(batchTexts, batchIndexes, translations, targetLanguage);
        }

        return Map.of("translations", translations);
    }

    private void appendTranslatedBatch(List<String> texts, List<Integer> indexes,
                                       List<String> translations, String targetLanguage) {
        List<String> translated = translateBatch(texts, targetLanguage);
        if (translated.size() != indexes.size()) {
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "번역 서비스에서 올바른 응답을 받지 못했습니다");
        }
        for (int i = 0; i < indexes.size(); i++) {
            translations.set(indexes.get(i), translated.get(i));
        }
    }

    private List<String> translateBatch(List<String> texts, String targetLanguage) {
        MultiValueMap<String, String> form = new LinkedMultiValueMap<>();
        texts.forEach(text -> form.add("text", text));
        form.add("target_lang", targetLanguage);

        try {
            JsonNode response = restClient.post()
                    .uri(apiUrl + "/v2/translate")
                    .header("Authorization", "DeepL-Auth-Key " + apiKey)
                    .contentType(MediaType.APPLICATION_FORM_URLENCODED)
                    .body(form)
                    .retrieve()
                    .body(JsonNode.class);
            JsonNode items = response == null ? null : response.path("translations");
            if (items == null || !items.isArray()) {
                throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "번역 서비스에서 올바른 응답을 받지 못했습니다");
            }
            List<String> translated = new ArrayList<>(items.size());
            for (JsonNode item : items) {
                JsonNode text = item.get("text");
                if (text == null || !text.isString()) {
                    throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "번역 서비스에서 올바른 응답을 받지 못했습니다");
                }
                translated.add(text.stringValue());
            }
            return translated;
        } catch (RestClientResponseException e) {
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "번역 서비스 요청에 실패했습니다");
        } catch (RestClientException e) {
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "번역 서비스에 연결할 수 없습니다");
        }
    }

}
