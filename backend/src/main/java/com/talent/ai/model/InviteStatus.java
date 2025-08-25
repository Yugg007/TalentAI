package com.talent.ai.model;

import jakarta.persistence.*;

@Entity
@Table(name = "invitation_status")
public class InviteStatus {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "form_id", nullable = false)
    private User fromUser;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "to_id", nullable = false)
    private User toUser;

    @Column(name = "send_invite")
    private String sendInvite;

    @Column(name = "send_msg")
    private String sendMsg;

    @Column(name = "invite_came")
    private String inviteCame;

    @Column(name = "invite_msg")
    private String inviteMsg;

    // --- Getters and Setters ---

    public Long getId() {
        return id;
    }

    public User getFromUser() {
        return fromUser;
    }

    public void setFromUser(User fromUser) {
        this.fromUser = fromUser;
    }

    public User getToUser() {
        return toUser;
    }

    public void setToUser(User toUser) {
        this.toUser = toUser;
    }

    public String getSendInvite() {
        return sendInvite;
    }

    public void setSendInvite(String sendInvite) {
        this.sendInvite = sendInvite;
    }

    public String getSendMsg() {
        return sendMsg;
    }

    public void setSendMsg(String sendMsg) {
        this.sendMsg = sendMsg;
    }

    public String getInviteCame() {
        return inviteCame;
    }

    public void setInviteCame(String inviteCame) {
        this.inviteCame = inviteCame;
    }

    public String getInviteMsg() {
        return inviteMsg;
    }

    public void setInviteMsg(String inviteMsg) {
        this.inviteMsg = inviteMsg;
    }
}
