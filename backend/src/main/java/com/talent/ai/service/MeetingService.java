package com.talent.ai.service;

import java.io.IOException;
import java.security.GeneralSecurityException;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Date;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.google.api.client.googleapis.auth.oauth2.GoogleCredential;
import com.google.api.client.googleapis.javanet.GoogleNetHttpTransport;
import com.google.api.client.json.JsonFactory;
import com.google.api.client.json.jackson2.JacksonFactory;
import com.google.api.services.calendar.Calendar;
import com.google.api.services.calendar.model.ConferenceData;
import com.google.api.services.calendar.model.ConferenceSolutionKey;
import com.google.api.services.calendar.model.CreateConferenceRequest;
import com.google.api.services.calendar.model.Event;
import com.google.api.services.calendar.model.EventAttendee;
import com.google.api.services.calendar.model.EventDateTime;
import com.talent.ai.model.MasterData;
import com.talent.ai.model.MeetingDetail;
import com.talent.ai.model.User;
import com.talent.ai.repository.MeetingRepository;
import com.talent.ai.utils.TimeUtil;

@Service
public class MeetingService {
	
	@Autowired
	private MeetingRepository meetingRepository;	
    
    @Autowired
    private TimeUtil timeUtil;
    
    @Autowired
    private MasterData masterData;    
	
	public void saveToMeetingDetail(String title, String username, String meetLink, String members, String date, String time, String duration, String eventId) {
		MeetingDetail md = new MeetingDetail();
		md.setAdmin(username);
		md.setTitle(title);
		md.setLink(meetLink);
		md.setJoinee(members);
		md.setDate(date);
		md.setTime(time);
		md.setDuration(duration);
		md.setEventId(eventId);
		
		meetingRepository.save(md);
		
	}

	public List<MeetingDetail> fetchAll(String username) {
		return meetingRepository.findByAdmin(username);
	}

	public String createMeeting(String username, String accessToken, Map<Object, Object> mp) throws GeneralSecurityException, IOException {
        String title = "Meeting";
        String date = (String) mp.get("date");
        String time = (String) mp.get("time");
        String duration = (String) mp.get("duration");
        String members = (String) mp.get("members");
        if (mp.containsKey("title")) {
            title = (String) mp.get("title");
        }

        LocalDateTime startDateTime = timeUtil.getDateTime(date, time);
        LocalDateTime endDateTime = startDateTime.plusMinutes(Long.valueOf(duration));

        if (accessToken == null) return "User not authorized";

        GoogleCredential credential = new GoogleCredential().setAccessToken(accessToken);
        JsonFactory jsonFactory = JacksonFactory.getDefaultInstance();

        Calendar service = new Calendar.Builder(
                GoogleNetHttpTransport.newTrustedTransport(),
                jsonFactory,
                credential
        ).setApplicationName("MockInterviewApp").build();

        Event event = new Event()
                .setSummary(title)
                .setStart(new EventDateTime()
                        .setDateTime(new com.google.api.client.util.DateTime(
                                Date.from(startDateTime.atZone(ZoneId.of("Asia/Kolkata")).toInstant())))
                        .setTimeZone("Asia/Kolkata"))
                .setEnd(new EventDateTime()
                        .setDateTime(new com.google.api.client.util.DateTime(
                                Date.from(endDateTime.atZone(ZoneId.of("Asia/Kolkata")).toInstant())))
                        .setTimeZone("Asia/Kolkata"));

        // ✅ Add attendees (they’ll get email invites and can join the Meet)
        List<EventAttendee> attendees = getAttendes(members);
        event.setAttendees(attendees);

        // ✅ Proper conferenceData request
        ConferenceData conferenceData = new ConferenceData()
                .setCreateRequest(new CreateConferenceRequest()
                        .setRequestId("meet-" + System.currentTimeMillis())
                        .setConferenceSolutionKey(
                                new ConferenceSolutionKey().setType("hangoutsMeet")
                        ));

        event.setConferenceData(conferenceData);

        // ✅ Insert event with conferenceDataVersion=1 (required)
        Event createdEvent = service.events()
                .insert("primary", event)
                .setConferenceDataVersion(1)
                .execute();

        // ✅ Extract Meet link safely
        String meetLink = createdEvent.getHangoutLink();
        if (meetLink == null && createdEvent.getConferenceData() != null &&
                createdEvent.getConferenceData().getEntryPoints() != null &&
                !createdEvent.getConferenceData().getEntryPoints().isEmpty()) {
            meetLink = createdEvent.getConferenceData().getEntryPoints().get(0).getUri();
        }
        
        String eventId = createdEvent.getId();

        saveToMeetingDetail(title, username, meetLink, members, date, time, duration, eventId);
        
        return meetLink;
	}
	
	public String deleteMeeting(String username, String accessToken, String eventId) throws GeneralSecurityException, IOException {
	    if (accessToken == null) return "User not authorized";

	    GoogleCredential credential = new GoogleCredential().setAccessToken(accessToken);
	    JsonFactory jsonFactory = JacksonFactory.getDefaultInstance();

	    Calendar service = new Calendar.Builder(
	            GoogleNetHttpTransport.newTrustedTransport(),
	            jsonFactory,
	            credential
	    ).setApplicationName("MockInterviewApp").build();

	    try {
	        // ✅ First fetch the event to check ownership
	        Event event = service.events().get("primary", eventId).execute();

	        // Check if the logged-in user is the creator
	        if (event.getCreator() != null && event.getCreator().getEmail().equalsIgnoreCase(masterData.fetchEmailViaUserName(username))) {
	            service.events().delete("primary", eventId).execute();

	            // Also remove from your DB
	            deleteFromMeetingDetail(eventId, username);

	            return "Meeting deleted successfully";
	        } else {
	            return "You are not the creator of this meeting";
	        }
	    } catch (Exception e) {
	        return "Failed to delete meeting: " + e.getMessage();
	    }
	}
	

	private void deleteFromMeetingDetail(String eventId, String username) {
		MeetingDetail md = meetingRepository.findByEventId(eventId);
		meetingRepository.delete(md);
		
	}

	private List<EventAttendee> getAttendes(String members) {
		List<EventAttendee> attendees = new ArrayList<>();
		
		List<String> usernames = Arrays.asList(members.split(","));
		
		for(String uname : usernames) {
			uname = uname.trim();
			String email  = masterData.fetchEmailViaUserName(uname);
			if(email != null) {
				EventAttendee attendee = new EventAttendee()
				        .setEmail(email)
				        .setDisplayName(uname)
				        .setOptional(true);
				attendees.add(attendee);
				
			}
			
		}
		
		return attendees;
	}

}
