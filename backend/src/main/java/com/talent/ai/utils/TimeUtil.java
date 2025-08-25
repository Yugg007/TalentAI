package com.talent.ai.utils;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

import org.springframework.stereotype.Component;

@Component
public class TimeUtil {
	
	public LocalDateTime getDateTime(String date, String time) {
//        String date = "2025-08-21";
//        String time = "21:56";
		
		if(date == null || time == null) {
			return LocalDateTime.now();
		}
		
        // Parse date and time
        LocalDate localDate = LocalDate.parse(date);
        LocalTime localTime = LocalTime.parse(time);

        // Create startDateTime
        LocalDateTime dateTime = LocalDateTime.of(localDate, localTime);
        
        return dateTime;
	}
}
