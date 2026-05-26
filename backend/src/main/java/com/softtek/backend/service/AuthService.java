package com.softtek.backend.service;

import com.softtek.backend.dto.AuthResponse;
import com.softtek.backend.dto.LoginRequest;
import com.softtek.backend.model.Usuario;
import com.softtek.backend.repository.UsuarioRepository;
import com.softtek.backend.security.JwtUtil;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    public AuthService(UsuarioRepository usuarioRepository,
                       PasswordEncoder passwordEncoder,
                       JwtUtil jwtUtil) {
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
    }

    public AuthResponse login(LoginRequest request) {
        Usuario usuario = usuarioRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new RuntimeException("Credenciales inválidas"));

        if (!passwordEncoder.matches(request.getPassword(), usuario.getPassword())) {
            throw new RuntimeException("Credenciales inválidas");
        }

        String token = jwtUtil.generateToken(usuario.getUsername());

        return new AuthResponse(
                token,
                usuario.getId(),
                usuario.getUsername(),
                usuario.getNombre(),
                usuario.getRol(),
                usuario.getArea()
        );
    }
}
