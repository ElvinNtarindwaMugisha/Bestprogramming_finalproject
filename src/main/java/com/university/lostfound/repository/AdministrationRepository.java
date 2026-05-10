package com.university.lostfound.repository;

import com.university.lostfound.model.Administration;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AdministrationRepository extends JpaRepository<Administration, Long> {
    java.util.Optional<Administration> findByAdminName(String adminName);
}