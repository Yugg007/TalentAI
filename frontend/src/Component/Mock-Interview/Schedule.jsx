import React, { useState, useEffect } from 'react';
import { BackendService } from '../../Utils/Api\'s/ApiMiddleWare';
import ApiEndpoints from '../../Utils/Api\'s/ApiEndpoints';
import './style.css';
import MultiSelect from '../Utility/MultiSelect/MultiSelect';
import Storage from '../../Utils/Storage';
import Loader from '../Utility/Loader';

const Schedule = () => {
    const [activeTab, setActiveTab] = useState('upcoming');
    const [meetingTitle, setMeetingTitle] = useState("");
    const [meetingDate, setMeetingDate] = useState("");
    const [meetingTime, setMeetingTime] = useState("");
    const [meetingDuration, setMeetingDuration] = useState("30");
    const [selectedUsers, setSelectedUsers] = useState([]);
    const [myConnections, setMyConnections] = useState([]);
    const [loader, setLoader] = useState(false);
    const [upcomingMeetings, setUpcomingMeetings] = useState([]);

    const fetchUsers = async () => {
        const body = {
            username: Storage.getStorageData('username')
        };
        const response = await BackendService(ApiEndpoints.getConnections, body);
        if (response?.data) {
            setMyConnections(response.data.myConnections || []);
        }

    }


    const fetchUpcomingMeetings = async () => {
        setLoader(true);
        try {
            const response = await BackendService(ApiEndpoints.getUpcomingMeetings, {});
            if (response?.data) {
                setUpcomingMeetings(response.data || []);
            } else {
                setUpcomingMeetings([]);
            }
        } catch (error) {
            console.error("Error fetching upcoming meetings:", error);
        }
        setLoader(false);
    };

    const handleScheduleMeeting = async () => {
        if (!meetingTitle || !meetingDate || !meetingTime) {
            alert("Please fill all meeting details");
            return;
        }

        const body = { title: meetingTitle, date: meetingDate, time: meetingTime, duration: meetingDuration, members: selectedUsers.join(", ") };

        try {
            const response = await BackendService(ApiEndpoints.scheduleMeeting, body);
            if (response?.data) {
                alert("Meeting scheduled successfully!");
                setMeetingTitle("");
                setMeetingDate("");
                setMeetingTime("");
                fetchUpcomingMeetings();
                setActiveTab('upcoming');
            } else {
                alert("Failed to schedule meeting.");
            }
        } catch (error) {
            console.error("Error scheduling meeting:", error);
            alert("Failed to schedule meeting.");
        }
    };

    const handleDeleteMeeting = async (eventId) => {
        if (!eventId) return;
        setLoader(true);
        try {
            const body = { eventId };
            const response = await BackendService(ApiEndpoints.deleteMeeting, body);
            if (response?.data) {
                alert("Meeting deleted successfully!");
                fetchUpcomingMeetings();
            } else {
                alert("Failed to delete meeting.");
            }
        } catch (error) {
            console.error("Error deleting meeting:", error);
            alert("Failed to delete meeting.");
        }
        setLoader(false);
    };

    useEffect(() => {
        fetchUpcomingMeetings();
    }, []);

    useEffect(() => {
        if (activeTab === 'schedule') {
            fetchUsers();
        }
    }, [activeTab]);

    return (
        <div>
            {loader && <Loader />}
            <div className="tab-header">
                <button
                    className={`tab-btn ${activeTab === 'upcoming' ? 'active' : ''}`}
                    onClick={() => setActiveTab('upcoming')}
                >
                    Upcoming Interviews
                </button>
                <button
                    className={`tab-btn ${activeTab === 'schedule' ? 'active' : ''}`}
                    onClick={() => setActiveTab('schedule')}
                >
                    Schedule Interview
                </button>
            </div>

            <div className="tab-content">
                {activeTab === 'schedule' && (
                    <div className="mock-form">
                        <h2>Schedule New Interview</h2>
                        <div className="mock-field">
                            <label>Meeting Title</label>
                            <input
                                type="text"
                                value={meetingTitle}
                                onChange={(e) => setMeetingTitle(e.target.value)}
                                placeholder="Enter meeting title"
                            />
                        </div>
                        <div className="mock-field">
                            <label>Date</label>
                            <input
                                type="date"
                                value={meetingDate}
                                onChange={(e) => setMeetingDate(e.target.value)}
                            />
                        </div>
                        <div className="mock-field">
                            <label>Time</label>
                            <input
                                type="time"
                                value={meetingTime}
                                onChange={(e) => setMeetingTime(e.target.value)}
                            />
                        </div>
                        <div className="mock-field">
                            <label>Choose duration</label>
                            <select value={meetingDuration} onChange={(e) => setMeetingDuration(e.target.value)}>
                                <option value="30">30 min</option>
                                <option value="60">1 hr</option>
                                <option value="90">1 hr 30 min</option>
                                <option value="120">2 hr</option>
                            </select>
                        </div>

                        <MultiSelect usernames={myConnections} selectedUsers={selectedUsers} setSelectedUsers={setSelectedUsers} />

                        <button className="mock-btn schedule-btn" onClick={handleScheduleMeeting}>
                            Schedule Interview
                        </button>
                    </div>
                )}

                {activeTab === 'upcoming' && (
                    <div className="upcoming-meetings">
                        <h2>Upcoming Interviews</h2>
                        {upcomingMeetings.length === 0 ? (
                            <p>No upcoming meetings.</p>
                        ) : (
                            <div className="meeting-list">
                                {upcomingMeetings.map((meeting, index) => (
                                    <div key={index} className="meeting-card">
                                        <div className="meeting-card-header">
                                            <h3>{meeting.title}</h3>
                                            <div className="meeting-actions">
                                                {meeting.link && (
                                                    <a
                                                        href={meeting.link}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="join-btn"
                                                    >
                                                        Join
                                                    </a>
                                                )}
                                                <button
                                                    className="delete-btn"
                                                    onClick={() => handleDeleteMeeting(meeting?.eventId)}
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </div>
                                        <p className="meeting-datetime">
                                            📅 {meeting.date} | ⏰ {meeting.time} | ⏳ {meeting.duration} min
                                        </p>
                                        <p className="meeting-members">👥 Members: {meeting.joinee || 'N/A'}</p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Schedule;
