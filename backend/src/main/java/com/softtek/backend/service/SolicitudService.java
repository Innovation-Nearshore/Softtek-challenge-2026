package com.softtek.backend.service;

import com.softtek.backend.dto.SolicitudRequest;
import com.softtek.backend.model.*;
import com.softtek.backend.repository.SolicitudRepository;
import com.softtek.backend.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class SolicitudService {

    private final SolicitudRepository solicitudRepository;
    private final UsuarioRepository usuarioRepository;

    public Solicitud crearSolicitud(SolicitudRequest request) {
        Usuario solicitante = usuarioRepository.findById(request.getSolicitanteId())
                .orElseThrow(() -> new IllegalArgumentException("Solicitante no encontrado con id: " + request.getSolicitanteId()));

        Solicitud solicitud = Solicitud.builder()
                .tipoSolicitud(request.getTipoSolicitud())
                .urgencia(request.getUrgencia())
                .descripcion(request.getDescripcion())
                .solicitante(solicitante)
                .areaDestino(request.getAreaDestino())
                .estado(EstadoSolicitud.RECIBIDA)
                .build();

        return solicitudRepository.save(solicitud);
    }

    public List<Solicitud> getBandeja(Usuario usuario, String tipoSolicitud, Urgencia urgencia) {
        boolean isAdmin = usuario.getRol() == Rol.ADMIN;

        if (isAdmin) {
            // Admin sees all
            if (tipoSolicitud != null && urgencia != null) {
                return solicitudRepository.findByTipoSolicitudAndUrgencia(tipoSolicitud, urgencia);
            } else if (tipoSolicitud != null) {
                return solicitudRepository.findByTipoSolicitud(tipoSolicitud);
            } else if (urgencia != null) {
                return solicitudRepository.findByUrgencia(urgencia);
            } else {
                return solicitudRepository.findAll();
            }
        } else {
            // Consultor sees only their area
            Area area = usuario.getArea();
            if (tipoSolicitud != null && urgencia != null) {
                return solicitudRepository.findByAreaDestinoAndTipoSolicitudAndUrgencia(area, tipoSolicitud, urgencia);
            } else if (tipoSolicitud != null) {
                return solicitudRepository.findByAreaDestinoAndTipoSolicitud(area, tipoSolicitud);
            } else if (urgencia != null) {
                return solicitudRepository.findByAreaDestinoAndUrgencia(area, urgencia);
            } else {
                return solicitudRepository.findByAreaDestino(area);
            }
        }
    }

    public Solicitud actualizarEstado(Long id, EstadoSolicitud nuevoEstado) {
        Solicitud solicitud = solicitudRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Solicitud no encontrada con id: " + id));

        EstadoSolicitud estadoActual = solicitud.getEstado();

        // Validate state transition: RECIBIDA → EN_REVISION → RESUELTA
        boolean transicionValida = false;
        if (estadoActual == EstadoSolicitud.RECIBIDA && nuevoEstado == EstadoSolicitud.EN_REVISION) {
            transicionValida = true;
        } else if (estadoActual == EstadoSolicitud.EN_REVISION && nuevoEstado == EstadoSolicitud.RESUELTA) {
            transicionValida = true;
        }

        if (!transicionValida) {
            throw new IllegalArgumentException(
                    "Transición de estado inválida: " + estadoActual + " → " + nuevoEstado +
                    ". Solo se permite: RECIBIDA → EN_REVISION → RESUELTA");
        }

        solicitud.setEstado(nuevoEstado);
        return solicitudRepository.save(solicitud);
    }
}
