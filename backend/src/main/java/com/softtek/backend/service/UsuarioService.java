package com.softtek.backend.service;

import com.softtek.backend.dto.UsuarioRequest;
import com.softtek.backend.model.Usuario;
import com.softtek.backend.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UsuarioService {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;

    public Usuario crearUsuario(UsuarioRequest request) {
        if (usuarioRepository.existsByUsername(request.getUsername())) {
            throw new IllegalArgumentException("El username ya existe: " + request.getUsername());
        }
        Usuario usuario = Usuario.builder()
                .nombre(request.getNombre())
                .username(request.getUsername())
                .password(passwordEncoder.encode(request.getPassword()))
                .area(request.getArea())
                .rol(request.getRol())
                .build();
        return usuarioRepository.save(usuario);
    }

    public List<Usuario> listarUsuarios() {
        return usuarioRepository.findAll();
    }

    public Usuario obtenerUsuario(Long id) {
        return usuarioRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Usuario no encontrado con id: " + id));
    }

    public Usuario actualizarUsuario(Long id, UsuarioRequest request) {
        Usuario usuario = obtenerUsuario(id);

        if (request.getNombre() != null && !request.getNombre().trim().isEmpty()) {
            usuario.setNombre(request.getNombre());
        }
        if (request.getUsername() != null && !request.getUsername().trim().isEmpty()
                && !request.getUsername().equals(usuario.getUsername())) {
            if (usuarioRepository.existsByUsername(request.getUsername())) {
                throw new IllegalArgumentException("El username ya existe: " + request.getUsername());
            }
            usuario.setUsername(request.getUsername());
        }
        if (request.getPassword() != null && !request.getPassword().trim().isEmpty()) {
            usuario.setPassword(passwordEncoder.encode(request.getPassword()));
        }
        if (request.getArea() != null) {
            usuario.setArea(request.getArea());
        }
        if (request.getRol() != null) {
            usuario.setRol(request.getRol());
        }
        return usuarioRepository.save(usuario);
    }
}
