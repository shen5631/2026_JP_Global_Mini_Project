package com.mirim.backend.service;

import com.mirim.backend.DTO.translate_DTO;
import com.sun.net.httpserver.HttpServer;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.net.InetSocketAddress;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.concurrent.atomic.AtomicReference;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

class Translation_ServiceTest {

    @Test
    void translatesTextsThroughDeepLUsingServerSideAuthorization() throws IOException {
        HttpServer server = HttpServer.create(new InetSocketAddress("127.0.0.1", 0), 0);
        AtomicReference<String> authorization = new AtomicReference<>();
        AtomicReference<String> requestBody = new AtomicReference<>();
        server.createContext("/v2/translate", exchange -> {
            authorization.set(exchange.getRequestHeaders().getFirst("Authorization"));
            requestBody.set(new String(exchange.getRequestBody().readAllBytes(), StandardCharsets.UTF_8));
            byte[] response = """
                    {"translations":[{"text":"こんにちは"},{"text":"おはよう"}]}
                    """.getBytes(StandardCharsets.UTF_8);
            exchange.getResponseHeaders().set("Content-Type", "application/json");
            exchange.sendResponseHeaders(200, response.length);
            try (var output = exchange.getResponseBody()) {
                output.write(response);
            }
        });
        server.start();

        try {
            String apiUrl = "http://127.0.0.1:" + server.getAddress().getPort();
            Translation_Service service = new Translation_Service("test-key", apiUrl);

            var result = service.translate(new translate_DTO(
                    List.of("안녕하세요", "좋은 아침"), "ja"));

            assertEquals(List.of("こんにちは", "おはよう"), result.get("translations"));
            assertEquals("DeepL-Auth-Key test-key", authorization.get());
            assertTrue(requestBody.get().contains("target_lang=JA"));
            assertTrue(requestBody.get().contains("text="));
        } finally {
            server.stop(0);
        }
    }

    @Test
    void reportsMissingApiKeyWithoutCallingDeepL() {
        Translation_Service service = new Translation_Service("", "https://api-free.deepl.com");

        ResponseStatusException exception = assertThrows(
                ResponseStatusException.class,
                () -> service.translate(new translate_DTO(List.of("안녕하세요"), "ja")));

        assertEquals(HttpStatus.SERVICE_UNAVAILABLE, exception.getStatusCode());
    }
}
