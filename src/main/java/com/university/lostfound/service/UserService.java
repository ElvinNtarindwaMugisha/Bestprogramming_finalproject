package com.university.lostfound.service;

import com.university.lostfound.model.*;
import com.university.lostfound.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final IDCardRepository idCardRepository;
    private final ClaimRepository claimRepository;
    private final LocationRepository locationRepository;

    public UserService(UserRepository userRepository,
            IDCardRepository idCardRepository,
            ClaimRepository claimRepository,
            LocationRepository locationRepository) {
        this.userRepository = userRepository;
        this.idCardRepository = idCardRepository;
        this.claimRepository = claimRepository;
        this.locationRepository = locationRepository;
    }

    public List<User> getAllUsers() {
        return userRepository.findAllOnlyUsers();
    }

    public Optional<User> getUserById(Long id) {
        return userRepository.findById(id);
    }

    @Transactional
    public User createUser(User user) {

        // Resolve location referencing using the provided Village code.
        // This abstracts the complex hierarchy validation from the API client.
        if (user.getLocation() != null && user.getLocation().getCode() != null) {
            String villageCode = user.getLocation().getCode();
            Location location = locationRepository.findByCode(villageCode)
                    .orElseThrow(() -> new RuntimeException("Village not found with code: " + villageCode));
            user.setLocation(location);
        }

        User savedUser = userRepository.save(user);

        if (user.getRegistrationNumber() != null && user.getCardNumber() != null) {
            String cardNumber = user.getCardNumber();
            if (idCardRepository.existsByCardNumber(cardNumber)) {
                throw new RuntimeException("ID Card already exists");
            }

            IDCard idCard = new IDCard();
            idCard.setCardNumber(cardNumber);
            idCard.setStatus("ACTIVE");
            idCard.setOwner(savedUser);
            idCardRepository.save(idCard);

            Claim claim = new Claim();
            claim.setClaimType("LOST");
            claim.setFoundLocation(null);
            claim.setIdCard(idCard);
            claimRepository.save(claim);

            savedUser.setIdCard(idCard);
        }

        return savedUser;
    }

    public User updateUser(Long id, User updated) {
        return userRepository.findById(id).map(user -> {
            user.setFullName(updated.getFullName());
            user.setRegistrationNumber(updated.getRegistrationNumber());
            user.setCardNumber(updated.getCardNumber());

            if (updated.getLocation() != null && updated.getLocation().getCode() != null) {
                String villageCode = updated.getLocation().getCode();
                Location location = locationRepository.findByCode(villageCode)
                        .orElseThrow(() -> new RuntimeException("Village not found with code: " + villageCode));
                user.setLocation(location);
            }

            return userRepository.save(user);
        }).orElseThrow(() -> new RuntimeException("User not found with id: " + id));
    }

    public void deleteUser(Long id) {
        userRepository.deleteById(id);
    }

    @Transactional(readOnly = true)
    public List<User> getUsersByProvinceCode(String code) {
        return userRepository.findAll().stream()
                .filter(u -> isChildOf(u.getLocation(), code))
                .toList();
    }

    /**
     * Recursively traverses the self-referencing Location table upwards to
     * determine
     * if a given location belongs to a specified parent code (e.g., checking if a
     * Village is in a Province).
     */
    private boolean isChildOf(Location loc, String parentCode) {
        if (loc == null)
            return false;
        if (loc.getCode().equals(parentCode))
            return true;
        return isChildOf(loc.getParent(), parentCode);
    }

    @Transactional(readOnly = true)
    public List<User> getUsersByProvinceName(String name) {
        return userRepository.findAll().stream()
                .filter(u -> isChildOfByName(u.getLocation(), name))
                .toList();
    }

    private boolean isChildOfByName(Location loc, String parentName) {
        if (loc == null)
            return false;
        if (loc.getName().equalsIgnoreCase(parentName))
            return true;
        return isChildOfByName(loc.getParent(), parentName);
    }
}
