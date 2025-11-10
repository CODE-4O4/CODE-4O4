# 🎯 Admin Portal Guide

## Overview
The admin portal allows you to manage pending member registrations from the "Get Started" form.

**Access:** `https://your-domain.com/admin`

---

## Features

### 1. **Club Member Requests Tab**

When someone fills out the "Get Started" form, their data is stored in the `pendingMembers` collection in Firebase. You can:

#### View Pending Applications
- See all pending member registration requests
- View member details: name, email, phone, interests, goals, experience
- Check when the request was submitted

#### Approve Members
1. Click **"Approve & Add to Club"** button
2. A popup will show:
   - Member name and email
   - **Generated User ID** (e.g., `user-1731274512345-abc123xyz`)
   - **Temporary Password** (e.g., `Club@x7y8z9ab`)
3. Credentials are automatically copied to your clipboard
4. Send these credentials to the member via email

**What happens on approval:**
- Member is added to the `members` collection in Firebase
- Member gets initial stats: 0 points, 0 badges
- Avatar is auto-generated based on their email
- Pending request is deleted from `pendingMembers`
- Action is logged in `adminDecisions` for audit trail

#### Reject Members
1. Click **"Reject"** button
2. Confirm rejection
3. Member data is deleted from `pendingMembers`
4. Action is logged in `adminDecisions`

---

### 2. **Project Join Requests Tab**

Manage requests from members wanting to join specific projects.

#### View Requests
- See which members want to join which projects
- View member and project details
- Check request timestamps

#### Approve Project Joins
1. Click **"Approve"** button
2. Member is added to the `projectMembers` collection
3. They can now collaborate on the project
4. Request is deleted from `projectInterests`

---

## Sending Credentials to New Members

### Email Template

```
Subject: Welcome to [Club Name]!

Hi [Member Name],

Congratulations! Your membership application has been approved.

Here are your login credentials:

User ID: [Generated User ID]
Temporary Password: [Generated Password]

Please login at: https://your-domain.com/login

We recommend changing your password after your first login.

Welcome to the team!

Best regards,
[Your Name]
Admin, [Club Name]
```

---

## Firebase Collections

### pendingMembers
- **Purpose:** Store "Get Started" form submissions
- **Status:** Temporary (deleted after approval/rejection)
- **Fields:** name, email, phone, github, portfolio, interests, experience, goals, role, availability, status

### members
- **Purpose:** Approved club members
- **Status:** Permanent
- **Fields:** id, name, email, points, badges, avatar, role, joinedAt, approvedBy, tempPassword

### adminDecisions
- **Purpose:** Audit trail of all admin actions
- **Status:** Permanent log
- **Fields:** type, memberId, decision, adminId, memberData, timestamp

---

## Troubleshooting

### No Pending Members Showing
1. Check if Firebase is connected (look for "Failed to fetch" errors)
2. Verify someone has submitted the "Get Started" form
3. Check Firestore console: `pendingMembers` collection should have documents

### Approval Not Working
1. Check Firebase Admin SDK credentials in Vercel
2. Verify Firestore rules allow write access
3. Check browser console for error messages

### Can't Copy Credentials
- Make sure you're using HTTPS (clipboard API requires secure context)
- Manually copy the credentials from the popup message

---

## Production Deployment

Your admin portal is deployed at:
**https://website-a2pmqmuso-geetansh-goyals-projects.vercel.app/admin**

The page auto-refreshes every 5 seconds to show new requests.

---

## Next Steps

1. **Set up email automation**: Integrate with SendGrid, Mailgun, or Resend to automatically email credentials
2. **Add password reset**: Allow members to reset their temporary password
3. **Role management**: Add ability to change member roles (admin, moderator, member)
4. **Bulk actions**: Approve/reject multiple members at once
5. **Search & filter**: Add search by name/email, filter by interests/experience

---

## Security Notes

⚠️ **Important:**
- Only admins should have access to `/admin`
- Temporary passwords should be changed by users on first login
- Consider implementing proper authentication/authorization
- Don't share credentials in plain text channels (use secure email)
