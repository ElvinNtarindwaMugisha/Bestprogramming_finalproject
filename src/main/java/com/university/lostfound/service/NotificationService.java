package com.university.lostfound.service;

import com.university.lostfound.model.Notification;
import com.university.lostfound.repository.NotificationRepository;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
public class NotificationService {

    private final NotificationRepository notificationRepository;

    public NotificationService(NotificationRepository notificationRepository) {
        this.notificationRepository = notificationRepository;
    }

    public List<Notification> getNotificationsByUserId(Long userId) {
        return notificationRepository.findByUserIdOrderByNotificationIdDesc(userId);
    }

    public Notification createNotification(String message, com.university.lostfound.model.User user) {
        Notification notification = new Notification();
        notification.setMessage(message);
        notification.setUser(user);
        return notificationRepository.save(notification);
    }

    public Notification createNotification(Notification notification) {
        return notificationRepository.save(notification);
    }

    public void deleteNotification(Long id) {
        notificationRepository.deleteById(id);
    }

    public void clearFoundNotifications(com.university.lostfound.model.User user, String cardNumber) {
        notificationRepository.deleteFoundNotificationsByCardNumber(user, cardNumber);
    }
}