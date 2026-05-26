package com.softtek.backend.repository;

import com.softtek.backend.model.Area;
import com.softtek.backend.model.Solicitud;
import com.softtek.backend.model.Urgencia;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SolicitudRepository extends JpaRepository<Solicitud, Long> {

    List<Solicitud> findByAreaDestino(Area areaDestino);

    List<Solicitud> findByAreaDestinoAndTipoSolicitud(Area areaDestino, String tipoSolicitud);

    List<Solicitud> findByAreaDestinoAndUrgencia(Area areaDestino, Urgencia urgencia);

    List<Solicitud> findByAreaDestinoAndTipoSolicitudAndUrgencia(Area areaDestino, String tipoSolicitud, Urgencia urgencia);

    List<Solicitud> findByTipoSolicitud(String tipoSolicitud);

    List<Solicitud> findByUrgencia(Urgencia urgencia);

    List<Solicitud> findByTipoSolicitudAndUrgencia(String tipoSolicitud, Urgencia urgencia);
}
