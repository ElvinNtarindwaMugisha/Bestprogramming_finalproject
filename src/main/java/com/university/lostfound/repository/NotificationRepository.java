package com.university.lostfound.repository;

import com.university.lostfound.model.Notification;
import com.university.lostfound.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {
    List<Notification> findByUserIdOrderByNotificationIdDesc(Long userId);

    @Modifying
    @Transactional
    @Query("DELETE FROM Notification n WHERE n.user = :user AND LOWER(n.message) LIKE LOWER(CONCAT('%', :cardNumber, '%')) AND LOWER(n.message) LIKE '%found%'")
    void deleteFoundNotificationsByCardNumber(@Param("user") User user, @Param("cardNumber") String cardNumber);
}