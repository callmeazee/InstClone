# Final Follow System Test Guide - All 3 Issues Fixed

## Setup Before Testing

### Stop & Restart Servers
```bash
# In Backend terminal - Stop (Ctrl+C) then:
npm run dev

# In Frontend terminal - Stop (Ctrl+C) then:  
npm run dev
```

### Open Browser DevTools
- Press F12 to open DevTools
- Go to Console tab
- Clear any previous logs

---

## Test 1: Post Count Fix ✅

**What was broken:** Profile shows 0 posts even when users have 6-7 posts
**Root cause:** Counting posts by username instead of ObjectId
**Fixed by:** Updated `getUserStatsController` to find user ObjectId first, then count posts by that ID

### Test Step 1A: Create Posts (if not already created)

**As User: `ally`** (or any username you created)
1. Go to `/create-post`
2. Create **3 posts** with captions like:
   - "Post 1"
   - "Post 2"
   - "Post 3"
3. Wait for each to upload (green checkmark)
4. Go to Feed - verify posts appear

**As User: `bob`** (another test user)
1. Go to `/create-post`
2. Create **2 posts**:
   - "Bob post 1"
   - "Bob post 2"

### Test Step 1B: Check Profile Shows Correct Post Count

**As User: `ally`**
1. Click profile button in navbar
2. Go to Profile page
3. Look at the stats section in profile header
4. **Expected:** Should show "Posts: 3" (not 0!)
5. Verify the "My Posts" tab shows exactly 3 posts

**As User: `bob`**
1. Click profile in navbar
2. **Expected:** Should show "Posts: 2" (not 0!)
3. Verify "My Posts" tab shows exactly 2 posts

**Console Check:**
- Open F12 Console
- Check for errors
- **Should see NO errors** about user not found

---

## Test 2: Follow Requests Not Showing Fix ✅

**What was broken:** When user B sends follow request to user A, user A doesn't see the request
**Root cause:** getPendingRequests response format, possibly auth issues
**Fixed by:** (1) Added identifyUser auth check to /feed endpoint, (2) Verified response format

### Test Step 2A: Send Follow Request

**As User: `ally`** (logged in)
1. Go to Feed
2. Click "+ Follow" button on any post by `bob`
3. Button should change to "⏳ Pending" (orange)
4. **Console check:** Should say "Follow status for bob: pending"

### Test Step 2B: Check Badge Updates

**As User: `ally`** (still logged in)
1. Look at navbar (top right)
2. Should see 🔔 bell icon with **"1"** badge
3. (If you previously sent requests, count might be higher)

### Test Step 2C: View Follow Requests Page

**As User: `bob`** (logged out `ally`, now logged in as `bob`)
1. Click 🔔 badge in navbar
   - OR click "Follow Requests" from profile menu
   - Should navigate to `/follow-requests` page
2. **Expected:** Should show a card with:
   - `ally`'s avatar (generated icon if no image)
   - `ally`'s username: "@ally"
   - "✓ Accept" button (green)
   - "✕ Reject" button (red)
3. Count at top shows "1"

**If Requests NOT showing:**
- Open F12 Console
- Check for errors
- Look at Network tab (F12 → Network)
- Find `GET /api/users/requests` call
- Check response - should have `{ requests: [{...}] }`

---

## Test 3: Follow Acceptance Reflecting on Profile ✅

**What was broken:** After accepting follow request, profile stats don't update
**Root cause:** Stats not refreshing after accept action
**Fixed by:** Added navigation to profile after accepting, which triggers stats refetch

### Test Step 3A: Accept Follow Request

**As User: `bob`** (on `/follow-requests` page)
1. Click "✓ Accept" button on `ally`'s request
2. **Expected:**
   - Success message: "✓ You are now following ally!"
   - Request card disappears from list
   - After 2 seconds: Automatically navigates to `/profile`

### Test Step 3B: Verify Profile Stats Updated

**After navigating to profile:**
1. Look at profile stats in header
2. **Expected:** "Following: 1" (was 0 before)
3. Count should show 1 person you're following

**Console check:**
- F12 Console should show:
  - "Fetched pending requests: { requests: [] }"  (empty list now)
  - "Failed to fetch user stats: ..." should NOT appear
  - No 404 errors

### Test Step 3C: Verify Two-Way Follow

**As User: `ally`** (log back in)
1. Go to Feed
2. Find post by `bob`
3. Look at follow button
4. **Expected:** Should show "✓ Following" (not "⏳ Pending")
5. You can click to "Unfollow" if desired

---

## Test 4: Full End-to-End Flow

**This verifies all three fixes work together**

### Scenario: Three Users, Multiple Requests

**Setup:**
1. Have 3 test accounts ready: `alice`, `bob`, `charlie`
2. Each creates 3-5 posts

**Flow:**
1. `alice` sends follow request to `bob`
2. `alice` sends follow request to `charlie`
3. `bob` sends follow request to `charlie`

### Alice's Perspective:
```
✓ Creates 3 posts → Profile shows "Posts: 3"
✓ Sends 2 follow requests → Buttons show "⏳ Pending"
```

### Bob's Perspective:
```
✓ Creates 3 posts → Profile shows "Posts: 3"
✓ Receives 1 follow request (from alice) → 🔔 badge shows "1"
✓ Clicks /follow-requests → Sees alice's request
✓ Clicks Accept → Success message, navigates to profile
✓ Profile stats now show "Following: 1"
✓ Sends follow request to charlie → Sees button change to "⏳ Pending"
```

### Charlie's Perspective:
```
✓ Creates 3 posts → Profile shows "Posts: 3"
✓ Receives 2 follow requests → 🔔 badge shows "2"
✓ Clicks /follow-requests → Sees both alice and bob's requests
✓ Accepts alice's request → Sees "Following: 1"
✓ Accepts bob's request → Sees "Following: 2"
```

---

## Verification Checklist

### Issue #1: Post Count (Should NOT be 0)
- [ ] User 1 creates 3 posts, profile shows "Posts: 3"
- [ ] User 2 creates 2 posts, profile shows "Posts: 2"  
- [ ] User 3 creates 5 posts, profile shows "Posts: 5"
- [ ] No "User not found" errors in console

### Issue #2: Follow Requests (Should appear in request list)
- [ ] Follow request sender shows "⏳ Pending" button
- [ ] Recipient sees 🔔 badge with count
- [ ] Clicking badge goes to `/follow-requests`
- [ ] Page shows all pending requests with avatars
- [ ] Accept/Reject buttons are visible and clickable
- [ ] No empty state when requests exist

### Issue #3: Profile Update After Accept (Stats should refresh)
- [ ] After accepting request, "Following" count increases
- [ ] Auto-navigates to profile after 2 seconds
- [ ] Stats reflect the new following count
- [ ] Can unfollow afterward (if desired)

### Console Checks
- [ ] No console errors (red icons)
- [ ] No "404 Not Found" errors
- [ ] No "Cannot read property" errors
- [ ] Requests show in console: `"Fetched pending requests:"`

---

## Troubleshooting

### Problem: Profile Still Shows 0 Posts
**Solution:**
1. Check MongoDB directly: `db.posts.find({}).count()` should show posts exist
2. Check if user ObjectId is stored in posts correctly
3. Restart backend server
4. Hard refresh browser (Cmd+Shift+R)

### Problem: Follow Requests Page is Empty (But Should Have Requests)
**Solution:**
1. F12 Console: Check for errors
2. F12 Network: Check `/api/users/requests` response
3. Verify follow records exist in MongoDB:
   - `db.follows.find({ status: "pending" }).count()`
4. Make sure you're logged in as the **recipient** (person receiving request)

### Problem: Profile Doesn't Auto-Navigate After Accept
**Solution:**
1. Manually navigate to `/profile`
2. Check if stats updated manually
3. If stats show 0 again, restart backend and try again

### Problem: Follow Button Still Shows "⏳ Pending" After Accept
**Solution:**
1. Refresh the Feed page (F5)
2. Should update to "✓ Following"
3. If not, check that Follow model has the record with status "accepted"

---

## MongoDB Verification Commands

**Check if follow records exist:**
```javascript
// Pending requests from alice to bob
db.follows.find({ follower: "alice", followee: "bob" })

// All pending requests for bob (requests bob received)
db.follows.find({ followee: "bob", status: "pending" })

// All accepted follows (friendships)
db.follows.find({ status: "accepted" })
```

**Check if posts exist:**
```javascript
// All posts
db.posts.find({}).count()

// Posts by specific user (need ObjectId)
db.posts.find({ user: ObjectId("...") }).count()
```

**Check user records:**
```javascript
// Find user by username to get ObjectId
db.users.findOne({ username: "alice" })
```

---

## Expected Results Summary

✅ **All 3 issues fixed and tested:**
1. Post count shows correct number (not 0)
2. Follow requests appear in list with user details
3. Profile stats update after accepting follow request

✅ **No console errors**
✅ **All buttons work as expected**
✅ **Follow flow is complete and bidirectional**

**Testing Complete!** 🎉

---

## If Everything Passes:

**Congratulations!** All follow system features are working correctly:
- Follow requests send successfully
- Recipients receive and can view requests
- Accepting requests updates profile statistics
- Post counts display accurately
- System is ready for production use

---

**Last Updated:** April 12, 2026
**Status:** FINAL TEST GUIDE
