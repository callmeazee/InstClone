# Complete Feature Testing Guide

## Prerequisites Setup
1. Start Backend: `npm run dev` in `/Backend` folder
2. Start Frontend: `npm run dev` in `/Frontend` folder
3. Have **2 test accounts** ready:
   - Account A: username "alice"
   - Account B: username "bob"

---

## Test Suite 1: Post Creation & Display ✅

### Test 1.1: Create Post
**Steps:**
1. Login as Account A
2. Click "📱 Create" button in navbar
3. Select an image
4. Add caption: "This is my first post!"
5. Click "Create Post"

**Expected Results:**
- ✅ Post appears at top of feed
- ✅ Shows your avatar, username, and "👤 Your Post" button
- ✅ Like count shows as 0
- ✅ Image displays correctly
- ✅ Caption displays below image

---

## Test Suite 2: Delete Post 🗑️

### Test 2.1: Delete Your Own Post
**Steps:**
1. Login as Account A (post owner)
2. Go to Feed
3. Find the post you created
4. Click red "🗑️ Delete" button

**Expected Results:**
- ✅ Confirmation dialog appears: "Are you sure you want to delete this post?"
- ✅ Button shows "⏳ Deleting..." state
- ✅ After confirming, post disappears immediately from feed
- ✅ Navigate to Profile → post is gone from "My Posts"

### Test 2.2: Cannot Delete Others' Posts
**Steps:**
1. Login as Account B
2. View Account A's post
3. Look for delete button

**Expected Results:**
- ✅ Red delete button does NOT appear
- ✅ Only "👤 Your Post" and follow button visible
- ✅ No delete option for other users' posts

---

## Test Suite 3: Follow Feature - Complete Flow 🔔

### Test 3.1: Send Follow Request
**Setup:** Account A logged in

**Steps:**
1. Go to Feed
2. Find a post from Account B (or Account A creates a post, logout, login as B to view it)
3. Click "+ Follow" button on Account B's post

**Expected Results:**
- ✅ Button immediately shows "⏳ Pending" state
- ✅ Button becomes DISABLED (cannot click again)
- ✅ All other posts from Account B on feed also show "⏳ Pending"
- ✅ No error message appears (success case)

### Test 3.2: View Follow Request (As Recipient)
**Setup:** Account B has pending follow request from Account A

**Steps:**
1. Logout from Account A
2. Login as Account B
3. Look at navbar - should see 🔔 badge with number

**Expected Results:**
- ✅ Navbar shows 🔔 (bell icon) with count badge (e.g., "🔔 1")
- ✅ Badge is yellow/golden color
- ✅ Bell has an animation (rings gently)

### Test 3.3: Accept Follow Request
**Setup:** Account B viewing Follow Requests

**Steps:**
1. Click on 🔔 badge in navbar
2. Should go to `/follow-requests` page
3. See Account A's request with:
   - Avatar/profile image
   - Username (@alice)
4. Click "✓ Accept" button

**Expected Results:**
- ✅ Page says "Follow Requests" with count
- ✅ Request card shows with proper styling (semi-transparent background)
- ✅ "✓ Accept" button turns green on hover
- ✅ "✕ Reject" button turns red on hover
- ✅ After clicking Accept:
  - Request disappears from list
  - Success message: "✓ You are now following alice!" appears

### Test 3.4: Verify Follow Status on Feed
**Setup:** Just accepted Account A's follow request

**Steps:**
1. Go back to Feed
2. Look at Account A's posts
3. Check follow button status

**Expected Results:**
- ✅ Button now shows "✓ Following" 
- ✅ Button is NOT disabled (can click to unfollow)
- ✅ All Account A posts show "✓ Following" button consistently

### Test 3.5: View Profile Stats
**Setup:** After accepting follow request

**Steps:**
1. Click profile button in navbar
2. Go to Profile page

**Expected Results:**
- ✅ Profile shows stats:
  - Posts: [count]
  - Followers: 1 (Account A now follows you)
  - Following: 0 (if you haven't followed anyone)

### Test 3.6: Unfollow User
**Setup:** You're following someone

**Steps:**
1. Go to Feed
2. Find post from someone you're following
3. Click "✓ Following" button

**Expected Results:**
- ✅ Button immediately changes to "+ Follow"
- ✅ Can click again to send new follow request
- ✅ Profile follower count decreases by 1

---

## Test Suite 4: Edge Cases & Error Handling

### Test 4.1: Prevent Duplicate Follow Requests (409 Handling)
**Setup:** Already sent follow request to someone

**Steps:**
1. Open browser DevTools (F12)
2. Go to Network tab
3. Try to click Follow again quickly
4. Check Network tab for 409 response

**Expected Results:**
- ✅ Receive 409 Conflict error from API
- ✅ Button STAYS "⏳ Pending" (doesn't revert)
- ✅ Error message: "⚠️ Follow request already sent and is pending..."
- ✅ Message disappears after 5 seconds
- ✅ Button remains disabled

### Test 4.2: Cannot Follow Yourself
**Setup:** Account A logged in, viewing own profile

**Steps:**
1. Try to click Follow on your own post
2. Would show "👤 Your Post" button

**Expected Results:**
- ✅ Button shows "👤 Your Post"
- ✅ Button is disabled
- ✅ Cannot click to follow yourself

### Test 4.3: User Not Found Error
**Setup:** Testing API error handling

**Steps:**
1. Use browser DevTools console
2. Run: `await fetch('http://localhost:3000/api/users/follow/nonexistent_user_xyz', {method: 'POST', credentials: 'include'})`

**Expected Results:**
- ✅ Returns 404 status
- ✅ Error message returned properly

### Test 4.4: Reject Follow Request
**Setup:** Have pending follow request

**Steps:**
1. Go to Follow Requests page
2. Click "✕ Reject" button

**Expected Results:**
- ✅ Request disappears
- ✅ Success message: "✓ Rejected request from [username]"
- ✅ Requester's button reverts to "+ Follow"

---

## Test Suite 5: Like & Save Features 👍

### Test 5.1: Like Post
**Steps:**
1. Find any post
2. Click heart/like button

**Expected Results:**
- ✅ Heart fills and animates (becomes red)
- ✅ Like count increases by 1
- ✅ Like count shows correctly

### Test 5.2: Unlike Post
**Steps:**
1. Click like button on already-liked post

**Expected Results:**
- ✅ Heart becomes empty (unfilled)
- ✅ Like count decreases by 1

### Test 5.3: Save Post
**Steps:**
1. Click bookmark/save button on any post

**Expected Results:**
- ✅ Bookmark icon fills and highlights
- ✅ Post added to "Saved Posts" tab in Profile
- ✅ Can unsave to remove

---

## Test Suite 6: Feed Filtering

### Test 6.1: View All Posts
**Steps:**
1. Click "📱 All Posts" button at top of feed

**Expected Results:**
- ✅ Shows posts from all users
- ✅ Shows post count

### Test 6.2: View My Posts Only
**Steps:**
1. Click "👤 My Posts" button

**Expected Results:**
- ✅ Shows only posts created by current user
- ✅ Shows correct count
- ✅ Shows delete button for each

### Test 6.3: Empty Feed
**Steps:**
1. Login as new account with no posts
2. Click "👤 My Posts"

**Expected Results:**
- ✅ Shows "No posts from you"
- ✅ Message: "Start creating and sharing your first post!"

---

## Test Suite 7: Cross-Session Persistence

### Test 7.1: Refresh Page
**Setup:** Following someone

**Steps:**
1. Refresh the page (F5)
2. Check if follow status is preserved

**Expected Results:**
- ✅ Follow status remains "✓ Following"
- ✅ Button is not reset to "+ Follow"
- ✅ Profile stats still show correct counts

### Test 7.2: Clear Cookies (Logout/Login)
**Steps:**
1. Fully logout
2. Login to same account

**Expected Results:**
- ✅ Follow relationships are preserved
- ✅ Saved posts are preserved
- ✅ All data persists

---

## Test Suite 8: UI/UX Checks

### Test 8.1: Button States
**Check these states exist and display correctly:**
- ✅ "+ Follow" - blue gradient, clickable
- ✅ "⏳ Pending" - orange gradient, DISABLED
- ✅ "✓ Following" - transparent border, clickable
- ✅ "👤 Your Post" - gray, disabled
- ✅ "🗑️ Delete" - red gradient, clickable (owner only)

### Test 8.2: Loading States
**Check during API calls:**
- ✅ Follow button: "🔄 Sending..."
- ✅ Delete button: "⏳ Deleting..."
- ✅ Like button: shows loading state

### Test 8.3: Error Messages
**Check error messages display as:**
- ✅ Red background with white text
- ✅ Emoji icons (❌, ⚠️, ✓)
- ✅ Auto-dismiss after 5 seconds
- ✅ Clear and helpful text

### Test 8.4: Responsive Design
**Check on mobile (DevTools):**
- ✅ Buttons stack properly
- ✅ Images resize correctly
- ✅ Text remains readable
- ✅ Follow button shows on mobile

---

## Browser Console Checks

### Check 1: No Console Errors
Open DevTools (F12) and check Console tab for:
- ✅ No red errors
- ✅ Expected logs appear (follow status checks)
- ✅ No "undefined" references

### Check 2: Network Requests
Check Network tab for successful API calls:
- ✅ `POST /api/users/follow/:username` - 201 status
- ✅ `GET /api/posts/feed` - 200 status
- ✅ `DELETE /api/posts/:id` - 200 status
- ✅ No failed network requests

---

## Summary Checklist

**Core Features:**
- [ ] Posts create successfully
- [ ] Posts delete successfully (owner only)
- [ ] Follow requests send properly
- [ ] Users can view follow requests
- [ ] Users can accept follow requests
- [ ] Follow status syncs across all posts
- [ ] Profile stats update correctly
- [ ] Users can unfollow others

**Error Handling:**
- [ ] 409 conflict keeps button in pending
- [ ] User not found shows error
- [ ] Cannot follow yourself
- [ ] Duplicate follow attempts handled

**UI/UX:**
- [ ] Button states display correctly
- [ ] Loading states show up
- [ ] Error messages display and dismiss
- [ ] Responsive on mobile

---

## Troubleshooting

### Issue: Follow button still shows + Follow after clicking
**Solution:** Check browser console for errors. Try refreshing page (F5). If persists, check backend logs for 500 errors.

### Issue: Delete button doesn't appear
**Solution:** Make sure you're logged in as post owner. Check that `currentUser.username === post.user.username`

### Issue: Follow requests page is empty
**Solution:** 
1. Check that you're logged in as different user
2. The other user must have sent you a follow request (not the other way around)
3. Request must have 'pending' status in database

### Issue: Delete shows error
**Solution:** Check backend server logs. Ensure post ID is valid. Check user authorization.

---

## Performance Notes

✅ Follow status is checked on component mount to catch existing requests
✅ Feed refreshes after follow actions (500ms delay for consistency)
✅ Posts immediately removed from UI after deletion
✅ Button states optimistically updated before API response
✅ Error messages auto-dismiss to prevent UI clutter

---

**Last Updated:** April 12, 2026
**All Features:** Ready for testing
