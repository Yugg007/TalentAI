package com.talent.ai.model;



import java.sql.Timestamp;
import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "meeting_detail")
public class MeetingDetail {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "meeting_id")
    private Long id;
    
    @Column(name = "meeting_link")
    private String link;
    
    @Column(name = "title")
    private String title;
    
    @Column(name = "admin")
    private String admin;
    
    @Column(name = "joinee")
    private String joinee;
    
    @Column(name = "date")
    private String date;
    
    @Column(name = "time")
    private String time;
    
    @Column(name = "duration")
    private String duration;
    
    @Column(name = "eventId")
    private String eventId;
    
    @Column(name = "createdOn")
    private Timestamp createdOn = Timestamp.valueOf(LocalDateTime.now());

	public String getEventId() {
		return eventId;
	}

	public void setEventId(String eventId) {
		this.eventId = eventId;
	}

	public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
	}

	public String getAdmin() {
		return admin;
	}

	public void setAdmin(String admin) {
		this.admin = admin;
	}

	public String getJoinee() {
		return joinee;
	}

	public void setJoinee(String joinee) {
		this.joinee = joinee;
	}

	public String getLink() {
		return link;
	}

	public void setLink(String link) {
		this.link = link;
	}

	public String getTitle() {
		return title;
	}

	public void setTitle(String title) {
		this.title = title;
	}

	public Timestamp getCreatedOn() {
		return createdOn;
	}

	public void setCreatedOn(Timestamp createdOn) {
		this.createdOn = createdOn;
	}

	public String getDate() {
		return date;
	}

	public void setDate(String date) {
		this.date = date;
	}

	public String getTime() {
		return time;
	}

	public void setTime(String time) {
		this.time = time;
	}

	public String getDuration() {
		return duration;
	}

	public void setDuration(String duration) {
		this.duration = duration;
	}
	
}
