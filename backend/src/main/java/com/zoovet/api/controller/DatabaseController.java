package com.zoovet.api.controller;

import com.zoovet.api.dto.DatabaseOperationResponse;
import com.zoovet.api.service.DatabaseService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/database")
@RequiredArgsConstructor
public class DatabaseController {

    private final DatabaseService databaseService;

    @PostMapping("/inject-sql")
    public ResponseEntity<DatabaseOperationResponse> injectSql() {
        DatabaseOperationResponse response = databaseService.injectSqlScript();
        return ResponseEntity.ok(response);
    }

    @GetMapping("/status")
    public ResponseEntity<DatabaseOperationResponse> getStatus() {
        DatabaseOperationResponse response = databaseService.getStatus();
        return ResponseEntity.ok(response);
    }
}
