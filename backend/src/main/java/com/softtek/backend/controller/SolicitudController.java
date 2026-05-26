package com.softtek.backend.controller;

import com.softtek.backend.dto.SolicitudRequest;
import com.softtek.backend.model.EstadoSolicitud;
import com.softtek.backend.model.Solicitud;
import com.softtek.backend.model.Urgencia;
import com.softtek.backend.model.Usuario;
import com.softtek.backend.service.SolicitudService;
import javax.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/solicitudes")
@RequiredArgsConstructor
public class SolicitudController {

    private final SolicitudService solicitudService;

    @PostMapping
    public ResponseEntity<?> crearSolicitud(@Valid @RequestBody SolicitudRequest request) {
        try {
            Solicitud solicitud = solicitudService.crearSolicitud(request);
            return ResponseEntity.status(HttpStatus.CREATED).body(solicitud);
        } catch (IllegalArgumentException e) {
            Map<String, String> err = new HashMap<>();
            err.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(err);
        }
    }

    @GetMapping("/bandeja")
    public ResponseEntity<?> getBandeja(
            Authentication authentication,
            @RequestParam(required = false) String tipo,
            @RequestParam(required = false) String urgencia) {
        try {
            Usuario usuario = (Usuario) authentication.getPrincipal();

            Urgencia urgenciaEnum = null;
            if (urgencia != null && !urgencia.trim().isEmpty()) {
                urgenciaEnum = Urgencia.valueOf(urgencia.toUpperCase());
            }

            List<Solicitud> solicitudes = solicitudService.getBandeja(usuario, tipo, urgenciaEnum);
            return ResponseEntity.ok(solicitudes);
        } catch (IllegalArgumentException e) {
            Map<String, String> err = new HashMap<>();
            err.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(err);
        }
    }

    @PutMapping("/{id}/estado")
    public ResponseEntity<?> actualizarEstado(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {
        try {
            String estadoStr = body.get("estado");
            if (estadoStr == null || estadoStr.trim().isEmpty()) {
                Map<String, String> err = new HashMap<>();
                err.put("error", "El campo 'estado' es requerido");
                return ResponseEntity.badRequest().body(err);
            }
            EstadoSolicitud nuevoEstado = EstadoSolicitud.valueOf(estadoStr.toUpperCase());
            Solicitud solicitud = solicitudService.actualizarEstado(id, nuevoEstado);
            return ResponseEntity.ok(solicitud);
        } catch (IllegalArgumentException e) {
            Map<String, String> err = new HashMap<>();
            err.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(err);
        }
    }
}
