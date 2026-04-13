#!/usr/bin/env bash

set -euo pipefail

BASE_URL="${1:-http://127.0.0.1:5173}"
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ARTIFACT_DIR="$ROOT_DIR/output/test-artifacts"
mkdir -p "$ARTIFACT_DIR"

TIMESTAMP="$(date +%s)"
USER_ONE="codex_smoke_${TIMESTAMP}_a"
USER_TWO="codex_smoke_${TIMESTAMP}_b"
EMAIL_ONE="${USER_ONE}@example.com"
EMAIL_TWO="${USER_TWO}@example.com"
PASS="codexpass123"
COOKIE_ONE="$ARTIFACT_DIR/user-one.cookies"
COOKIE_TWO="$ARTIFACT_DIR/user-two.cookies"
IMAGE_FILE="$ARTIFACT_DIR/tiny.png"

if [[ ! -f "$IMAGE_FILE" ]]; then
  printf 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aQ1EAAAAASUVORK5CYII=' | base64 -d > "$IMAGE_FILE"
fi

register_one="$(curl -sS -c "$COOKIE_ONE" -H 'Content-Type: application/json' -d "{\"username\":\"$USER_ONE\",\"email\":\"$EMAIL_ONE\",\"password\":\"$PASS\"}" "$BASE_URL/api/auth/register")"
register_two="$(curl -sS -c "$COOKIE_TWO" -H 'Content-Type: application/json' -d "{\"username\":\"$USER_TWO\",\"email\":\"$EMAIL_TWO\",\"password\":\"$PASS\"}" "$BASE_URL/api/auth/register")"
me_one="$(curl -sS -b "$COOKIE_ONE" "$BASE_URL/api/auth/me")"
create_post="$(curl -sS -b "$COOKIE_ONE" -F "image=@$IMAGE_FILE" -F 'caption=Smoke test post from Codex' "$BASE_URL/api/posts")"
post_id="$(printf '%s' "$create_post" | node -e "let data='';process.stdin.on('data',d=>data+=d);process.stdin.on('end',()=>{const json=JSON.parse(data);process.stdout.write(json.post._id);});")"
feed_two="$(curl -sS -b "$COOKIE_TWO" "$BASE_URL/api/posts/feed")"
like_two="$(curl -sS -b "$COOKIE_TWO" -X POST "$BASE_URL/api/posts/like/$post_id")"
comment_two="$(curl -sS -b "$COOKIE_TWO" -H 'Content-Type: application/json' -d '{"text":"Smoke comment"}' "$BASE_URL/api/comments/$post_id")"
comment_id="$(printf '%s' "$comment_two" | node -e "let data='';process.stdin.on('data',d=>data+=d);process.stdin.on('end',()=>{const json=JSON.parse(data);process.stdout.write(json.comment._id);});")"
comments_list="$(curl -sS "$BASE_URL/api/comments/$post_id")"
save_two="$(curl -sS -b "$COOKIE_TWO" -X POST "$BASE_URL/api/users/save/$post_id")"
saved_two="$(curl -sS -b "$COOKIE_TWO" "$BASE_URL/api/users/saved/posts")"
follow_two="$(curl -sS -b "$COOKIE_TWO" -X POST "$BASE_URL/api/users/follow/$USER_ONE")"
requests_one="$(curl -sS -b "$COOKIE_ONE" "$BASE_URL/api/users/requests")"
accept_one="$(curl -sS -b "$COOKIE_ONE" -X POST "$BASE_URL/api/users/accept/$USER_TWO")"
status_two="$(curl -sS -b "$COOKIE_TWO" "$BASE_URL/api/users/status/$USER_ONE")"
unsave_two="$(curl -sS -b "$COOKIE_TWO" -X POST "$BASE_URL/api/users/unsave/$post_id")"
unlike_two="$(curl -sS -b "$COOKIE_TWO" -X POST "$BASE_URL/api/posts/unlike/$post_id")"
delete_comment_two="$(curl -sS -b "$COOKIE_TWO" -X DELETE "$BASE_URL/api/comments/$comment_id")"
delete_post_one="$(curl -sS -b "$COOKIE_ONE" -X DELETE "$BASE_URL/api/posts/$post_id")"
logout_one="$(curl -sS -b "$COOKIE_ONE" -c "$COOKIE_ONE" -X POST "$BASE_URL/api/auth/logout")"
me_after_logout="$(curl -sS -o /tmp/codex-me-after-logout.json -w '%{http_code}' -b "$COOKIE_ONE" "$BASE_URL/api/auth/me")"

node - <<'NODE' \
  "$USER_ONE" "$USER_TWO" "$register_one" "$register_two" "$me_one" "$create_post" "$feed_two" "$like_two" \
  "$comment_two" "$comments_list" "$save_two" "$saved_two" "$follow_two" "$requests_one" "$accept_one" \
  "$status_two" "$unsave_two" "$unlike_two" "$delete_comment_two" "$delete_post_one" "$logout_one" "$me_after_logout"
const [
  userOne,
  userTwo,
  registerOne,
  registerTwo,
  meOne,
  createPost,
  feedTwo,
  likeTwo,
  commentTwo,
  commentsList,
  saveTwo,
  savedTwo,
  followTwo,
  requestsOne,
  acceptOne,
  statusTwo,
  unsaveTwo,
  unlikeTwo,
  deleteCommentTwo,
  deletePostOne,
  logoutOne,
  meAfterLogout,
] = process.argv.slice(2);

const payloads = {
  registerOne: JSON.parse(registerOne),
  registerTwo: JSON.parse(registerTwo),
  meOne: JSON.parse(meOne),
  createPost: JSON.parse(createPost),
  feedTwo: JSON.parse(feedTwo),
  likeTwo: JSON.parse(likeTwo),
  commentTwo: JSON.parse(commentTwo),
  commentsList: JSON.parse(commentsList),
  saveTwo: JSON.parse(saveTwo),
  savedTwo: JSON.parse(savedTwo),
  followTwo: JSON.parse(followTwo),
  requestsOne: JSON.parse(requestsOne),
  acceptOne: JSON.parse(acceptOne),
  statusTwo: JSON.parse(statusTwo),
  unsaveTwo: JSON.parse(unsaveTwo),
  unlikeTwo: JSON.parse(unlikeTwo),
  deleteCommentTwo: JSON.parse(deleteCommentTwo),
  deletePostOne: JSON.parse(deletePostOne),
  logoutOne: JSON.parse(logoutOne),
  meAfterLogout: Number(meAfterLogout),
};

const checks = [
  payloads.registerOne.user?.username === userOne,
  payloads.registerTwo.user?.username === userTwo,
  payloads.meOne.user?.username === userOne,
  Boolean(payloads.createPost.post?._id),
  Array.isArray(payloads.feedTwo.posts) && payloads.feedTwo.posts.some((post) => post._id === payloads.createPost.post._id),
  payloads.likeTwo.message?.toLowerCase().includes('liked'),
  Boolean(payloads.commentTwo.comment?._id),
  Array.isArray(payloads.commentsList.comments) && payloads.commentsList.comments.length >= 1,
  payloads.saveTwo.message?.toLowerCase().includes('saved'),
  Array.isArray(payloads.savedTwo.saved) && payloads.savedTwo.saved.length >= 1,
  payloads.followTwo.message?.toLowerCase().includes('follow request sent'),
  Array.isArray(payloads.requestsOne.requests) && payloads.requestsOne.requests.some((req) => req.follower === userTwo),
  payloads.acceptOne.message?.toLowerCase().includes('accepted'),
  payloads.statusTwo.followStatus === 'accepted',
  payloads.unsaveTwo.message?.toLowerCase().includes('unsaved'),
  payloads.unlikeTwo.message?.toLowerCase().includes('unliked'),
  payloads.deleteCommentTwo.message?.toLowerCase().includes('deleted'),
  payloads.deletePostOne.message?.toLowerCase().includes('deleted'),
  payloads.logoutOne.message?.toLowerCase().includes('logged out'),
  payloads.meAfterLogout === 401,
];

if (checks.some((passed) => !passed)) {
  console.error(JSON.stringify(payloads, null, 2));
  process.exit(1);
}

console.log(JSON.stringify({
  userOne,
  userTwo,
  postId: payloads.createPost.post._id,
  checksPassed: checks.length,
}, null, 2));
NODE
