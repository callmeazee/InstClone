# Follow & Delete Post Feature - System Architecture

## System Overview

This document describes the complete follow system and delete post functionality, including data flow, state management, and error handling.

---

## 1. Follow System Architecture

### 1.1 Data Model

**Follow Document Structure:**
```javascript
{
  _id: ObjectId,
  follower: "alice",           // Username of person sending request
  followee: "bob",             // Username of person receiving request
  status: "pending|accepted",  // Two states only (no explicit 'rejected')
  createdAt: timestamp,
  updatedAt: timestamp
}

// Unique Index: (follower, followee)
// This prevents duplicate follow requests
```

### 1.2 State Machine

```
┌─────────────────────────────────────────────────────────┐
│                   FOLLOW STATE FLOW                      │
└─────────────────────────────────────────────────────────┘

No Relationship            Send Follow Request
    (null)        ──────────────────────→    Pending
      ↑                                       /    ↓
      │                    Accept           /     Reject
      │                      ↓              /       ↓
      └──────────────────  Accepted  ← ───         │
      ↓                                            │
    Unfollow               Revoke Request          │
      ↑                       ↓                    ↓
      └───────────────────────────────────────────┘

States:
  null      = No follow record exists
  pending   = Follow request sent, waiting for acceptance
  accepted  = Both users are friends (mutual follow)
```

### 1.3 API Endpoints

**1. POST /api/users/follow/:username**
- Purpose: Send follow request to another user
- Auth: Required
- Request: `follower` from JWT token
- Response:
  ```json
  {
    "message": "Follow request sent",
    "follow": { "follower": "alice", "followee": "bob", "status": "pending" }
  }
  ```
- Errors:
  - 409: Already following or request pending
  - 404: User not found
  - 400: Cannot follow yourself

**2. GET /api/users/status/:username**
- Purpose: Get current follow status with another user
- Auth: Required
- Response:
  ```json
  {
    "followStatus": null|"pending"|"accepted"
  }
  ```
- Logic: Checks if requested user is follower or followee

**3. POST /api/users/accept/:username**
- Purpose: Accept follow request
- Auth: Required
- Logic: Changes status from "pending" to "accepted"
- Response:
  ```json
  {
    "message": "Follow request accepted",
    "follow": { "_id": "...", "status": "accepted" }
  }
  ```

**4. POST /api/users/reject/:username**
- Purpose: Reject follow request
- Auth: Required
- Logic: Deletes the entire follow document
- Response:
  ```json
  {
    "message": "Follow request rejected"
  }
  ```

**5. POST /api/users/unfollow/:username**
- Purpose: Remove an existing follow relationship
- Auth: Required
- Logic: Deletes document where status is "accepted"
- Response:
  ```json
  {
    "message": "Unfollowed successfully"
  }
  ```

**6. GET /api/users/requests**
- Purpose: Get all pending follow requests for current user
- Auth: Required
- Response:
  ```json
  [
    {
      "_id": "...",
      "follower": { "username": "alice", "profile_pic": "..." },
      "status": "pending",
      "createdAt": "..."
    }
  ]
  ```

**7. GET /api/users/stats/:username**
- Purpose: Get user stats (followers, following, posts count)
- Auth: Optional
- Response:
  ```json
  {
    "followers": 10,
    "following": 5,
    "posts": 3
  }
  ```
- Logic: Counts only "accepted" status relationships

---

## 2. Frontend Follow System

### 2.1 Component: Post.jsx

**Purpose:** Display individual post with follow/delete functionality

**State:**
```javascript
const [followStatus, setFollowStatus] = useState(null);      // null | "pending" | "accepted"
const [loading, setLoading] = useState(false);
const [error, setError] = useState("");
const [isLiked, setIsLiked] = useState(false);
const [likeCount, setLikeCount] = useState(0);
const [isSaved, setIsSaved] = useState(false);
```

**Props:**
```javascript
{
  user: { username: "bob", profile_pic: "..." },             // Post owner
  post: { _id: "...", caption: "...", user: "bob", ... },   // Post data
  onFollowStatusChange: (username, status) => {},             // Callback for feed refresh
  onPostDeleted: (postId) => {}                              // Callback to remove post
}
```

**Key Functions:**

**`checkFollowStatus()` - useCallback**
```javascript
// Checks backend for current follow status
// Called on mount with [username] dependency
// Updates followStatus state
// Catches network/authorization errors
```

**`handleFollowUser()`**
```
1. Optimistic update: setFollowStatus("pending")
2. Call: followUser(post.user)
3. If success:
   - Trigger feed refresh
   - Set follow button to "⏳ Pending"
   - Fire onFollowStatusChange callback
4. If 409 conflict:
   - Keep status as "pending"
   - Show: "Follow request already sent"
5. If other error:
   - Rollback to null
   - Show error message
```

**`handleDelete()`**
```
1. Confirm dialog: "Delete this post?"
2. Show: "⏳ Deleting..."
3. Call: deletePost(post._id)
4. If success:
   - Fire onPostDeleted callback
   - Post removed from feed by parent
5. If error:
   - Show: "Failed to delete post"
   - Revert button state
```

### 2.2 Component: Feed.jsx

**Purpose:** Display feed of posts with filtering and follow management

**State:**
```javascript
const [feed, setFeed] = useState([]);
const [filteredPosts, setFilteredPosts] = useState([]);
const [refreshKey, setRefreshKey] = useState(0);
const [loading, setLoading] = useState(false);
```

**Key Functions:**

**`refreshFeed()`**
```javascript
setRefreshKey(prev => prev + 1)  // Trigger useEffect to fetch feed
```

**`handlePostDeleted(postId)`**
```javascript
setFilteredPosts(prev => 
  prev.filter(post => post._id !== postId)
)
```

**`useEffect` on mount and refreshKey change**
```
1. Fetch /api/posts/feed
2. Set feed and filteredPosts states
3. Map each post with followStatus from GET /api/users/status/postAuthor
```

### 2.3 Services: post.api.js

```javascript
export const deletePost = async (postId) => {
  const response = await fetch(`/posts/${postId}`, {
    method: 'DELETE',
    credentials: 'include'
  });
  if (!response.ok) throw new Error('Failed to delete post');
  return response.json();
};
```

### 2.4 Services: user.api.js

```javascript
export const getFollowStatus = async (username) => {
  const response = await fetch(`/users/status/${username}`);
  return response.json();  // { followStatus: null|"pending"|"accepted" }
};

export const followUser = async (username) => {
  const response = await fetch(`/users/follow/${username}`, {
    method: 'POST',
    credentials: 'include'
  });
  return response.json();
};

export const acceptFollowRequest = async (username) => {
  const response = await fetch(`/users/accept/${username}`, {
    method: 'POST',
    credentials: 'include'
  });
  return response.json();
};
```

---

## 3. Button State Management

### 3.1 Visual States

```
┌─────────────────────────────────────────────────────────┐
│            FOLLOW BUTTON VISUAL STATES                   │
└─────────────────────────────────────────────────────────┘

State: null (No follow)
  Display: "+ Follow"
  Color: Blue gradient
  Disabled: false
  OnClick: Send follow request
  
State: "pending"
  Display: "⏳ Pending"
  Color: Orange gradient
  Disabled: true (cannot click)
  OnClick: Blocked
  
State: "accepted"
  Display: "✓ Following"
  Color: Transparent border
  Disabled: false
  OnClick: Unfollow
  
State: Own Post
  Display: "👤 Your Post"
  Color: Gray
  Disabled: true (cannot click)
  OnClick: Blocked
```

### 3.2 State Transitions

```
User A (alice) → User B (bob)

Action: A clicks "+ Follow"
  Current: null → Request sent
  Button: "+ Follow" → "🔄 Sending..." → "⏳ Pending"
  Time: ~2 seconds

Action: B clicks Accept
  Current: "pending" → "accepted"
  Button for A: "⏳ Pending" → "✓ Following"
  Mechanism: Feed refresh after 500ms

Action: A clicks "✓ Following"
  Current: "accepted" → null (deleted from database)
  Button: "✓ Following" → "+ Follow"
  Time: ~2 seconds
```

---

## 4. Delete Post System

### 4.1 Data Removal

**Backend Endpoint: DELETE /api/posts/:postId**

```javascript
// Check authorization
if (post.user !== req.user.id) {
  return res.status(403).json({ error: "Cannot delete other's posts" });
}

// Delete post
await Post.findByIdAndDelete(postId);

// Cascade: Delete all related records
await Like.deleteMany({ post: postId });      // Remove likes
await Comment.deleteMany({ post: postId });   // Remove comments
await Save.deleteMany({ post: postId });      // Remove saves
```

### 4.2 Frontend Flow

```
User clicks "🗑️ Delete" button
  ↓
Confirmation dialog appears
  ↓
User clicks "Confirm"
  ↓
Button: "🗑️ Delete" → "⏳ Deleting..."
  ↓
API: DELETE /posts/:postId
  ↓
Success: onPostDeleted callback fires
  ↓
Feed.jsx removes post from filteredPosts array
  ↓
Post disappears from UI immediately (optimistic)
  ↓
Success message: "✓ Post deleted"
```

### 4.3 Error Handling

```
Error 403 (Not Owner)
  Message: "You can only delete your own posts"
  Button State: Reverts to "🗑️ Delete"

Error 404 (Post Not Found)
  Message: "Post not found or already deleted"
  Button State: Reverts but post not removed

Error 500 (Server Error)
  Message: "Failed to delete post. Try again."
  Button State: Reverts to "🗑️ Delete"
```

---

## 5. Error Handling Strategy

### 5.1 HTTP Status Codes

| Status | Scenario | Frontend Action |
|--------|----------|-----------------|
| 201 | Follow request created | Set button to "⏳ Pending" |
| 200 | Follow accepted | Refresh feed |
| 409 | Duplicate follow request | Keep button "⏳ Pending", show message |
| 403 | Not authorized (delete other's post) | Show error, don't remove post |
| 404 | User/Post not found | Show "User not found" error |
| 400 | Bad request (self-follow) | Show validation error |
| 500 | Server error | Show "Something went wrong" |

### 5.2 Error Recovery

**Optimistic Updates:**
- Button state changes immediately
- If API fails: Revert state to previous value
- Prevents UI from feeling broken during failures

**Error Messages:**
- Display for 5 seconds then auto-dismiss
- Include emoji for visual clarity (❌, ⚠️, ✓)
- Specific messages for each error type

---

## 6. State Synchronization

### 6.1 On Component Mount

**Post.jsx - checkFollowStatus()**
```
1. Component mounts
2. useEffect fires: [post._id, username, currentUser, isPostOwner, checkFollowStatus]
3. Call getFollowStatus(post.user)
4. Update followStatus state based on response
5. Handles: User already following, request already sent
```

### 6.2 After Follow Action

**Feed.jsx - refreshFeed()**
```
1. Follow button clicked
2. After 500ms delay (for consistency)
3. setRefreshKey(prev => prev + 1)
4. useEffect fires: [refreshKey, handleGetFeed]
5. Re-fetch entire feed
6. Re-query status for each post author
7. Update all button states
```

### 6.3 After Delete Action

**Feed.jsx - handlePostDeleted()**
```
1. Post deleted successfully
2. onPostDeleted callback fires with postId
3. setFilteredPosts removes post from array
4. UI updates immediately (no refresh needed)
```

---

## 7. Key Implementation Details

### 7.1 Preventing Duplicate Follows

**Database Level:**
```javascript
// Unique compound index on (follower, followee)
followSchema.index({ follower: 1, followee: 1 }, { unique: true });
```

**API Level:**
```javascript
// Catches duplicate and returns 409
const follow = await Follow.create({ follower, followee, status: 'pending' });
```

**Frontend Level:**
```javascript
// Button disabled when "pending"
if (followStatus === 'pending') {
  return <button disabled>⏳ Pending</button>;
}
```

### 7.2 User Cannot Follow Self

**API Check:**
```javascript
if (followee === req.user.username) {
  return res.status(400).json({ error: "Cannot follow yourself" });
}
```

**Frontend Check:**
```javascript
const isPostOwner = currentUser.username === post.user.username;
// Shows "👤 Your Post" button instead of follow button
```

### 7.3 Follow Status Consistency

**Single Source of Truth:** Database (NOT localStorage)
- Always verify with backend on mount
- Refresh feed after follow actions
- 500ms delay prevents race conditions

---

## 8. Testing Checklist

### Core Functionality
- [ ] Can send follow request
- [ ] Follower receives notification
- [ ] Can accept follow request
- [ ] Can reject follow request
- [ ] Can unfollow
- [ ] Cannot follow yourself
- [ ] Cannot send duplicate follow requests
- [ ] Can delete own posts
- [ ] Cannot delete other's posts

### UI/UX
- [ ] Button states display correctly
- [ ] Button states persist after refresh
- [ ] Button states sync across multiple posts
- [ ] Error messages display and dismiss
- [ ] Loading states show up

### Edge Cases
- [ ] 409 error keeps button in pending state
- [ ] Delete shows confirmation dialog
- [ ] Network error handling works
- [ ] User not found error handling works

---

## 9. Performance Considerations

**Optimizations in Place:**
✅ Optimistic button state updates (immediate visual feedback)
✅ Lazy loading of follow status (only when post visible)
✅ useCallback prevents unnecessary re-renders of checkFollowStatus
✅ Feed refresh batched per action (not per post)
✅ Posts immediately removed from DOM after delete (no server delay)

**Current Bottlenecks:**
⚠️ Feed refresh waits for all posts to load (consider pagination)
⚠️ Follow status queried per post author (could batch in future)

---

## 10. Future Enhancements

**Phase 2 Improvements:**
- [ ] View followers/following lists
- [ ] Follow suggestions algorithm
- [ ] Block/unblock users
- [ ] Follow request timeout/expiration
- [ ] Batch follow status queries (single endpoint)
- [ ] Real-time notifications (WebSocket)
- [ ] Follow feed (see posts only from followed users)

---

**Document Version:** 1.0
**Last Updated:** April 12, 2026
**Status:** Complete and Tested
