package com.ecommerce.api.service;

import com.ecommerce.api.dto.request.AddressRequest;
import com.ecommerce.api.dto.request.LoginRequest;
import com.ecommerce.api.dto.request.RegisterUserRequest;
import com.ecommerce.api.dto.response.AuthResponse;
import com.ecommerce.api.dto.response.UserResponse;
import com.ecommerce.api.exception.AccountSuspendedException;
import com.ecommerce.api.exception.AlreadyExistsException;
import com.ecommerce.api.exception.BadRequestException;
import com.ecommerce.api.exception.ResourceNotFoundException;
import com.ecommerce.api.mapper.UserMapper;
import com.ecommerce.api.model.Address;
import com.ecommerce.api.model.Role;
import com.ecommerce.api.model.User;
import com.ecommerce.api.repository.UserRepository;
import com.ecommerce.api.security.JwtService;
import com.ecommerce.api.security.UserPrincipal;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

@Service
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final UserMapper userMapper;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    public UserServiceImpl(UserRepository userRepository, UserMapper userMapper, PasswordEncoder passwordEncoder, JwtService jwtService,
            AuthenticationManager authenticationManager) {
        this.userRepository = userRepository;
        this.userMapper = userMapper;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.authenticationManager = authenticationManager;
    }

    @Override
    public UserResponse registerUser(RegisterUserRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new AlreadyExistsException("Bu e-posta adresi zaten kayıtlı: " + request.getEmail());
        }

        User user = userMapper.toEntity(request);

        // Şifreyi BCrypt ile hash'le
        user.setPassword(passwordEncoder.encode(request.getPassword()));

        // Varsayılan rol olarak ROLE_USER ata
        user.setRole(Role.ROLE_USER);

        // Yeni kayıtlar her zaman aktif başlar (builder/audit null kalırsa da güvence)
        user.setActive(true);

        User savedUser = userRepository.save(user);
        return userMapper.toResponse(savedUser);
    }

    @Override
    public AuthResponse login(LoginRequest request) {
        // Kullanıcı var mı kontrol et (yoksa 404)
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", request.getEmail()));

        // Eski şema (roles dizisi) dönüşümü: role/active null ise authenticate öncesi otomatik tamir et
        // (UserPrincipal.getAuthorities() eski kayıtlarda NPE fırlatmasın diye)
        boolean modified = false;
        if (user.getRole() == null) {
            user.setRole(Role.ROLE_USER);
            modified = true;
        }
        if (user.getActive() == null) {
            user.setActive(true);
            modified = true;
        }
        if (modified) {
            userRepository.save(user);
        }

        // Hesabı askıya alınan kullanıcının girişini engelle
        if (!Boolean.TRUE.equals(user.getActive())) {
            throw new AccountSuspendedException("Hesabınız Askıya Alındı. Detaylı bilgi için lütfen destek ekibiyle iletişime geçin.");
        }

        // Kullanıcı adı ve şifreyi AuthenticationManager ile doğrula
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail(),
                        request.getPassword()
                )
        );

        // JWT access token üret
        String accessToken = jwtService.generateToken(new UserPrincipal(user));

        // Yanıtı oluştur
        return AuthResponse.builder()
                .accessToken(accessToken)
                .user(userMapper.toResponse(user))
                .build();
    }

    @Override
    public UserResponse getUserById(String id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", id));
        return userMapper.toResponse(user);
    }

    @Override
    public Page<UserResponse> getAllUsers(String searchName, String searchEmail, Role role, Pageable pageable) {
        return userRepository.findUsersByCriteria(searchName, searchEmail, role, pageable)
                .map(userMapper::toResponse);
    }

    @Override
    public UserResponse updateUserRole(String adminId, String targetUserId, Role newRole) {
        if (newRole == null) {
            throw new BadRequestException("Rol alanı boş olamaz");
        }

        // Kendi rolünü değiştirme engeli
        if (Objects.equals(adminId, targetUserId)) {
            throw new BadRequestException("Kendi rolünüzü değiştiremezsiniz");
        }

        User targetUser = userRepository.findById(targetUserId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", targetUserId));

        // Son admin koruması: hedef admin ise ve aktif admin sayısı 1 ise engelle
        if (targetUser.getRole() == Role.ROLE_ADMIN
                && userRepository.countByRoleAndActiveTrue(Role.ROLE_ADMIN) <= 1) {
            throw new BadRequestException("Son adminin rolü değiştirilemez");
        }

        targetUser.setRole(newRole);
        User savedUser = userRepository.save(targetUser);
        return userMapper.toResponse(savedUser);
    }

    @Override
    public UserResponse updateUserStatus(String adminId, String targetUserId, boolean active) {
        // Kendi hesabını askıya alma/aktifleştirme engeli
        if (Objects.equals(adminId, targetUserId)) {
            throw new BadRequestException("Kendi hesabınızı askıya alamazsınız");
        }

        User targetUser = userRepository.findById(targetUserId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", targetUserId));

        // Askıya alma durumunda son admin koruması
        if (!active
                && targetUser.getRole() == Role.ROLE_ADMIN
                && Boolean.TRUE.equals(targetUser.getActive())
                && userRepository.countByRoleAndActiveTrue(Role.ROLE_ADMIN) <= 1) {
            throw new BadRequestException("Son admin askıya alınamaz");
        }

        targetUser.setActive(active);
        targetUser.setSuspendedAt(active ? null : LocalDateTime.now());
        User savedUser = userRepository.save(targetUser);
        return userMapper.toResponse(savedUser);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Address> getUserAddresses(String userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));
        return user.getAddresses() != null ? user.getAddresses() : new ArrayList<>();
    }

    @Override
    @Transactional
    public Address addUserAddress(String userId, AddressRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        List<Address> addresses = user.getAddresses();
        if (addresses == null) {
            addresses = new ArrayList<>();
        }

        Address address = Address.builder()
                .label(request.getLabel())
                .street(request.getStreet())
                .city(request.getCity())
                .zipCode(request.getZipCode())
                .country(request.getCountry())
                .build();

        addresses.add(address);
        user.setAddresses(addresses);
        userRepository.save(user);
        return address;
    }

    @Override
    @Transactional
    public Address updateUserAddress(String userId, int addressIndex, AddressRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        List<Address> addresses = user.getAddresses();
        if (addresses == null || addressIndex < 0 || addressIndex >= addresses.size()) {
            throw new BadRequestException("Geçersiz adres indexi: " + addressIndex);
        }

        Address existing = addresses.get(addressIndex);

        Address updated = Address.builder()
                .label(request.getLabel() != null ? request.getLabel() : existing.getLabel())
                .street(request.getStreet())
                .city(request.getCity())
                .zipCode(request.getZipCode())
                .country(request.getCountry())
                .build();

        addresses.set(addressIndex, updated);
        user.setAddresses(addresses);
        userRepository.save(user);
        return updated;
    }

    @Override
    @Transactional
    public void deleteUserAddress(String userId, int addressIndex) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        List<Address> addresses = user.getAddresses();
        if (addresses == null || addressIndex < 0 || addressIndex >= addresses.size()) {
            throw new BadRequestException("Geçersiz adres indexi: " + addressIndex);
        }

        addresses.remove(addressIndex);
        user.setAddresses(addresses);
        userRepository.save(user);
    }
}