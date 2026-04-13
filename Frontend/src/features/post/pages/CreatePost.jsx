import React, { useState, useRef, useEffect } from 'react'
import '../style/createPost.scss'
import { usePost } from '../hook/usePost'
import { useAuth } from '../../auth/hooks/useAuth'
import { useNavigate } from 'react-router-dom'

const CreatePost = () => {
    const { user, isInitialized } = useAuth()
    const navigate = useNavigate()
    const [caption, setCaption] = useState('')

    // Redirect to login if not authenticated (but wait for auth initialization)
    useEffect(() => {
        if (isInitialized && !user) {
            navigate('/login')
        }
    }, [user, isInitialized, navigate])
    const [selectedFile, setSelectedFile] = useState(null)
    const [preview, setPreview] = useState(null)
    const [error, setError] = useState('')
    const postImageInputFieldRef = useRef(null)
    const { loading, handleCreatePost, error: hookError } = usePost()

    const handleFileSelect = (e) => {
        const file = e.target.files?.[0]
        if (!file) return

        // Validate file type
        if (!file.type.startsWith('image/')) {
            setError('Please select an image file')
            return
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            setError('File size must be less than 5MB')
            return
        }

        setSelectedFile(file)
        setError('')

        // Show preview
        const reader = new FileReader()
        reader.onloadend = () => {
            setPreview(reader.result)
        }
        reader.readAsDataURL(file)
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')

        // Validation
        if (!selectedFile) {
            setError('Please select an image')
            return
        }

        if (!caption.trim()) {
            setError('Caption is required')
            return
        }

        try {
            await handleCreatePost(selectedFile, caption.trim())
            // Success - reset form and navigate
            setCaption('')
            setSelectedFile(null)
            setPreview(null)
            navigate('/feed')
        } catch (err) {
            // Error is handled by hook but we can show it too
            console.error('Create post error:', err)
        }
    }

    return (
        <main className="create-post-page">
            <div className="form-container">
                <h1>Create Post</h1>
                <form onSubmit={handleSubmit}>
                    {(error || hookError) && (
                        <div className="form-error">{error || hookError}</div>
                    )}

                    <div className="form-group">
                        {preview && (
                            <div className="image-preview">
                                <img src={preview} alt="Preview" />
                            </div>
                        )}
                        <label 
                            htmlFor="postImage" 
                            className="file-label"
                        >
                            {selectedFile ? '✓ Image Selected' : 'Select Image'}
                        </label>
                        <input 
                            ref={postImageInputFieldRef}
                            hidden 
                            type="file" 
                            id="postImage" 
                            name="postImage"
                            accept="image/*"
                            onChange={handleFileSelect}
                        />
                        <textarea
                            value={caption}
                            onChange={(e) => setCaption(e.target.value)}
                            placeholder='Write a caption...'
                            name="caption"
                            rows="4"
                        />
                    </div>
                    <button 
                        type="submit"
                        disabled={loading}
                        className='button primary-button'
                    >
                        {loading ? 'Creating Post...' : 'Create Post'}
                    </button>
                </form>
            </div>
        </main>
    )
}

export default CreatePost