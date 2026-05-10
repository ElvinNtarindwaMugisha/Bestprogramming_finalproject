package com.university.lostfound.repository;

import com.university.lostfound.model.User;
import com.university.lostfound.model.Location;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

public interface UserRepository extends JpaRepository<User, Long> {
    List<User> findByLocation(Location location);

    @Modifying
    @Transactional
    @Query("UPDATE User u SET u.location = null")
    void clearLocationReferences();

    @Query("SELECT u FROM User u WHERE TYPE(u) = User")
    List<User> findAllOnlyUsers();

    java.util.Optional<User> findByRegistrationNumber(String registrationNumber);
}
