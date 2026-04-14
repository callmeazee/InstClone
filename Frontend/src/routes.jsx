import {BrowserRouter as Router, Routes, Route} from 'react-router-dom'

import Home from './features/home/Home'
import Login from './features/auth/pages/Login'
import Register from './features/auth/pages/Register'
import CreatePost from './features/post/pages/CreatePost'
import Feed from './features/post/pages/Feed'
import Profile from './features/post/pages/Profile'
import FollowRequests from './features/user/pages/FollowRequests'
import Search from './features/search/Search'


function RoutesComponent() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home/>} />
        <Route path='/feed' element={<Feed />} />
        <Route path='/login' element={<Login />} />
        <Route path='/register' element={<Register />} />
        <Route path='/profile' element={<Profile />} />
        <Route path='/create-post' element={<CreatePost />} />
        <Route path='/follow-requests' element={<FollowRequests />} />
        <Route path='/search' element={<Search />} />
        <Route path='*' element={<h1>404 Not Found</h1>} />
      </Routes>
    </Router>
  )
}   
export default RoutesComponent