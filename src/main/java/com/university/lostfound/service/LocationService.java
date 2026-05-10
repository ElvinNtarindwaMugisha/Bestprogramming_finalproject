package com.university.lostfound.service;

import com.university.lostfound.model.Location;
import com.university.lostfound.model.Elocation;
import com.university.lostfound.repository.LocationRepository;
import com.university.lostfound.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class LocationService {

    private final LocationRepository locationRepository;
    private final UserRepository userRepository;

    public LocationService(LocationRepository locationRepository, UserRepository userRepository) {
        this.locationRepository = locationRepository;
        this.userRepository = userRepository;
    }

    public List<Location> getAllLocations() {
        return locationRepository.findAll();
    }

    public Optional<Location> getLocationById(UUID id) {
        return locationRepository.findById(id);
    }

    public Optional<Location> getLocationByCode(String code) {
        return locationRepository.findByCode(code);
    }

    public Location saveLocation(Location location) {
        return locationRepository.save(location);
    }

    public void deleteLocation(UUID id) {
        locationRepository.deleteById(id);
    }

    @Transactional
    public void seedRwandaLocations() {

        // Temporarily clear references to avoid foreign key constraint violations
        // before truncating and rebuilding the entire self-referencing Location
        // hierarchy.
        userRepository.clearLocationReferences();

        locationRepository.truncateTable();

        Location kigali = createLocation("Kigali City", "KGL", Elocation.PROVINCE, null);

        Location kicukiro = createLocation("Kicukiro", "KCK", Elocation.DISTRICT, kigali);

        Location kigarama = createLocation("Kigarama", "KGR", Elocation.SECTOR, kicukiro);

        Location kigaramaCell = createLocation("Kigarama Cell", "KGR-CEL", Elocation.CELL, kigarama);
        createLocation("Amahoro Village", "KGR-AMA", Elocation.VILLAGE, kigaramaCell);
        createLocation("Umucyo Village", "KGR-UMU", Elocation.VILLAGE, kigaramaCell);
        createLocation("Gatare Village", "KGR-GAT", Elocation.VILLAGE, kigaramaCell);

        Location nyaruramaCell = createLocation("Nyarurama Cell", "NYR-CEL", Elocation.CELL, kigarama);
        createLocation("Imena Village", "NYR-IME", Elocation.VILLAGE, nyaruramaCell);
        createLocation("Abanyamahoro Village", "NYR-ABN", Elocation.VILLAGE, nyaruramaCell);
    }

    private Location createLocation(String name, String code, Elocation type, Location parent) {
        Location loc = new Location();
        loc.setName(name);
        loc.setCode(code);
        loc.setType(type);
        loc.setParent(parent);
        return locationRepository.save(loc);
    }
}
