# Quick Debugging Reference

## Follow Button Not Changing After Click

### Symptom
Click "+ Follow" button → Nothing happens or button reverts to original state

### Diagnosis Steps
1. **Check Browser Console (F12)**
   - Look for red error messages
   - Check Network tab (F12 → Network)
   - Look for failed requests to `/api/users/follow/:username`

2. **Check Backend Server**
   - Is backend running? (`npm run dev` in Backend folder)
   - Check terminal for MongoDB connection errors
   - Check terminal for API errors when button clicked

3. **Check Authentication**
   - Are you logged in?
   - Check if JWT token in cookies (F12 → Application → Cookies)
   - Try logging out and logging back in

### Common Causes & Fixes

| Problem | Cause | Solution |
|---------|-------|----------|
| Button shows error "401 Unauthorized" | JWT token expired or missing | Log out and log back in |
| Button shows "Follow request already sent" (409) | Already sent request to this user | This is EXPECTED - button should stay pending |
| Button reverts after click | Network error | Check internet connection, backend server |
| Button stuck in pending forever | API didn't respond | Force refresh (F5) and try again |
| Cannot see follow button at all | Own post or post owner can't follow | This is EXPECTED - should show "👤 Your Post" |

---

## Delete Button Not Appearing

### Symptom
On my own post, delete button doesn't show

### Diagnosis Steps
1. **Check You're Post Owner**
   ```javascript
   // In browser console:
   // If currentUser.username equals post.user.username, button should appear
   ```

2. **Check Component Logic**
   - Is `useAuth` hook imported in Post.jsx?
   - Is `const { user: currentUser } = useAuth()` in component?
   - Is `const isPostOwner = currentUser?.username === post.user.username`?

3. **Check Browser Console**
   - Any errors when post loads?
   - Check Network tab for user auth endpoint

### Common Causes & Fixes

| Problem | Cause | Solution |
|---------|-------|----------|
| Delete button shows but click does nothing | Confirmation dialog not appearing | Check browser console for errors |
| Delete shows error "403 Forbidden" | Attempting to delete someone else's post | The button should only appear for owner |
| Delete removes post but then it reappears | Feed refresh happening after deletion | This is normal, refresh should complete quickly |
| Cannot see "🗑️ Delete" button at all | Not the post owner | Only post owners see delete button |

---

## Follow Requests Not Showing

### Symptom
Click 🔔 badge → No requests shown on page

### Diagnosis Steps
1. **Verify You Have Pending Requests**
   - Ask another user to send you a follow request
   - Wait ~2 seconds for network response
   - Refresh page (F5)

2. **Check Badge Count**
   - Look at navbar - does 🔔 badge show a number?
   - If badge shows "0", there are no pending requests
   - If badge shows number but page is empty, there's a data issue

3. **Check Backend**
   ```javascript
   // In MongoDB, check follow collection:
   db.follows.find({ followee: "yourUsername", status: "pending" })
   // Should return requests where you are the followee
   ```

4. **Check Browser Console**
   - Network tab: Did `/api/users/requests` call succeed?
   - Console: Any JavaScript errors?

### Common Causes & Fixes

| Problem | Cause | Solution |
|---------|-------|----------|
| Badge shows "1" but page is empty | Follow requests not loading | Refresh page or check network in DevTools |
| Page shows "No pending requests" but badge shows number | Data sync issue | Hard refresh (Cmd+Shift+R on Mac) |
| Requests appear then disappear | Page reloading after accepting | Expected behavior, page refreshes |
| Cannot reject request | Authorization issue | Check if authenticated, try logging out/in |

---

## 409 Error: "Follow Request Already Sent"

### Symptom
Try to follow someone → Error message appears

### This is EXPECTED
The follow button:
1. Sends request → Changes to "⏳ Pending"
2. If you click again quickly → Gets 409 error
3. Should STAY at "⏳ Pending" (this is correct)

### Why It Happens
- Database has unique index on (follower, followee)
- Protects against duplicate follow requests
- Button is disabled so you shouldn't see this often

### If You See It When Button Isn't Disabled
This indicates a bug:
1. Check browser console for errors
2. Try refreshing page (F5)
3. Check that button is actually disabled (CSS issue?)

---

## Profile Stats Not Updating

### Symptom
After accepting follow request, profile shows wrong counts

### Diagnosis Steps
1. **Refresh Page**
   - Hard refresh: Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows)
   - Wait 5 seconds
   - Check if counts updated

2. **Check Backend Database**
   - Count follow records with status "accepted"
   - Verify both users in relationship

3. **Check Following Status**
   - Go to feed
   - Look for button showing "✓ Following"

### Common Causes & Fixes

| Problem | Cause | Solution |
|---------|-------|----------|
| Followers count still 0 | Stats endpoint not called after accept | Hard refresh page |
| Following count shows -1 or wrong number | Database error or API issue | Check backend logs |
| Same person counted twice | Data corruption | Contact admin, may need database reset |

---

## Page Not Loading / Blank Screen

### Symptom
Feed page or profile page shows nothing

### Immediate Checks
1. **Check Backend**
   - Is backend running? (see terminal output)
   - Are there errors in backend server logs?
   - Try restarting with `npm run dev`

2. **Check Browser Console (F12)**
   - Are there red error messages?
   - Look at Network tab
   - Check for 500 errors from API

3. **Check Internet Connection**
   - Is frontend able to reach backend?
   - Try opening `/health` or root endpoint

4. **Check Cookies**
   - F12 → Application → Cookies
   - Verify JWT token exists
   - If missing, log out and log back in

### Recovery Steps
1. Hard refresh: Cmd+Shift+R
2. Clear cookies: F12 → Application → Clear All
3. Log out entirely
4. Close browser completely
5. Reopen and log back in

---

## Cannot Accept/Reject Follow Request

### Symptom
Click accept or reject button → Nothing happens or error shows

### Diagnosis Steps
1. **Check You're Logged In**
   - As correct user (the one receiving request)
   - Check username in navbar

2. **Check Network Request**
   - F12 → Network tab
   - Click Accept button
   - Look for POST request to `/api/users/accept/:username`
   - Check if response is 200 or error

3. **Check Backend Logs**
   - Server showing errors?
   - Check database connection

### Common Causes & Fixes

| Problem | Cause | Solution |
|---------|-------|----------|
| 401 Unauthorized | JWT token expired | Log out and log back in |
| 404 Not Found | User doesn't exist | Check username spelling |
| 409 Conflict | Already accepted this request | Refresh page, request should disappear |
| 500 Server Error | Backend crash or database error | Check backend logs, restart server |

---

## Test Data Setup

### Quick Way to Test Follow Feature

**Create Test Users:**
1. Sign up as `testuser1` with email `test1@test.com`
2. Sign up as `testuser2` with email `test2@test.com`

**Create Test Posts:**
1. As `testuser1`: Create a post with caption "Test post 1"
2. As `testuser1`: Create another post with caption "Test post 2"
3. As `testuser2`: Create a post with caption "Test post from user 2"

**Test Follow Flow:**
1. Log out, log in as `testuser2`
2. Go to Feed
3. Find posts from `testuser1`
4. Click "+ Follow" on one post
5. Should change to "⏳ Pending"
6. Go to Follow Requests (click 🔔 badge)
7. Click "✓ Accept"
8. Go back to Feed
9. Button should now show "✓ Following"
10. Try clicking to Unfollow

---

## Browser Developer Tools Quick Reference

### Open DevTools
- Mac: Cmd + Option + I
- Windows: F12 or Ctrl + Shift + I

### Key Tabs to Check

**Console Tab (Ctrl+Shift+K)**
- Look for red error messages
- Search for errors containing: "fetch", "error", "undefined"

**Network Tab (Cmd+Option+E)**
- Filter by "XHR" (API requests only)
- Look for red colored requests (failures)
- Click request to see:
  - Request headers (check Authorization)
  - Response body (error message)
  - Status code (200, 409, 500, etc.)

**Application Tab (Cmd+Option+U)**
- Cookies: Verify JWT token exists
- Local Storage: Check for auth data
- Session Storage: Temporary data

**Performance Tab**
- Check if page is slow
- Look for long operations during follow/delete

---

## Database Debugging

### If You Have MongoDB GUI Access

**Check Follow Records:**
```javascript
// See all pending requests for a user
db.follows.find({ followee: "bob", status: "pending" })

// See all accepted follows
db.follows.find({ status: "accepted" })

// See if duplicate exists
db.follows.find({ follower: "alice", followee: "bob" })
```

**Check Post Records:**
```javascript
// Find posts by user
db.posts.find({ user: "alice" })

// Check if post still exists after "delete"
db.posts.findById(ObjectId("..."))
```

**Check User Records:**
```javascript
// Verify user exists
db.users.findOne({ username: "alice" })

// Check if JWT token issued
db.authTokens.find({ user: userId })
```

---

## Common Error Messages Explained

| Message | Meaning | Action |
|---------|---------|--------|
| "401 Unauthorized" | JWT token missing or expired | Log out and log back in |
| "403 Forbidden" | You don't have permission (e.g., deleting someone else's post) | Only perform action if authorized |
| "404 Not Found" | User or post doesn't exist | Check username/ID spelling |
| "409 Conflict" | Follow request already sent to this user | This will show when you click follow twice quickly |
| "500 Internal Server Error" | Backend crashed or database error | Check backend logs, restart server |
| "Cannot read property 'username' of undefined" | currentUser is null (not logged in) | Log in first |
| "Failed to fetch" | Backend not running or network issue | Start backend, check internet |

---

## Performance Checklist

**Check These If Page Feels Slow:**

- [ ] Backend running? (takes 5 seconds to start)
- [ ] Feed loading too many posts? (should be < 100)
- [ ] Image files too large? (should be < 1MB each)
- [ ] Too many API calls? (check Network tab)
- [ ] Mobile vs Desktop? (mobile slower is normal)
- [ ] WiFi or Cellular? (WiFi faster is normal)

---

## Clean Slate Recovery (Nuclear Option)

If everything is broken:

**Frontend:**
```bash
cd Frontend
# Clear cache
rm -rf node_modules .vite
npm install
npm run dev
```

**Backend:**
```bash
cd Backend
# Restart
npm run dev
```

**Browser:**
1. F12 → Application → Clear All
2. Close all browser tabs
3. Restart browser
4. Go to localhost:5173

**MongoDB (If Needed):**
```javascript
// Delete all test data
db.follows.deleteMany({})
db.posts.deleteMany({})
db.like.deleteMany({})
// Re-create users by signing up again
```

---

**Last Updated:** April 12, 2026
**Test Status:** All features operational
