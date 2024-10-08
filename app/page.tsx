'use client';

import { useState, useEffect } from 'react';

type Post = {
  id: number;
  title: string;
  content: string;
  published: boolean;
};

export default function Home() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [editingPostId, setEditingPostId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [titleError, setTitleError] = useState<string | null>(null);
  const [contentError, setContentError] = useState<string | null>(null);

  // Fetch all posts
  useEffect(() => {
    async function fetchPosts() {
      setLoading(true);
      const res = await fetch('/api/posts');
      const data: Post[] = await res.json();
      setPosts(data);
      setLoading(false);
    }
    fetchPosts();
  }, []);

  // Validate input fields
  const validateFields = () => {
    let valid = true;

    if (!title.trim()) {
      setTitleError('Title cannot be empty');
      valid = false;
    } else {
      setTitleError(null);
    }

    if (!content.trim()) {
      setContentError('Content cannot be empty');
      valid = false;
    } else {
      setContentError(null);
    }

    return valid;
  };

  // Create a new post
  const createPost = async () => {
    if (!validateFields()) {
      return;
    }

    const res = await fetch('/api/posts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ title, content }),
    });
    const newPost: Post = await res.json();
    setPosts([...posts, newPost]);
    setTitle('');
    setContent('');
  };

  // Start editing a post
  const startEditing = (post: Post) => {
    setEditingPostId(post.id);
    setTitle(post.title);
    setContent(post.content);
  };

  // Update a post
  const updatePost = async () => {
    if (!validateFields()) {
      return;
    }

    const res = await fetch(`/api/posts/${editingPostId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ title, content }),
    });
    const updatedPost: Post = await res.json();
    setPosts(posts.map(post => (post.id === editingPostId ? updatedPost : post)));
    setTitle('');
    setContent('');
    setEditingPostId(null); // Reset editing state
  };

  // Delete a post
  const deletePost = async (id: number) => {
    await fetch(`/api/posts/${id}`, {
      method: 'DELETE',
    });
    setPosts(posts.filter(post => post.id !== id));
  };

  // Toggle post published state
  const togglePublish = async (id: number, published: boolean) => {
    const res = await fetch(`/api/posts/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ published: !published }),
    });
    const updatedPost: Post = await res.json();
    setPosts(posts.map(post => (post.id === id ? updatedPost : post)));
  };

  // Handle Enter key for submission
  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement | HTMLInputElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) { // Prevent newline on Enter if Shift is not held
      event.preventDefault();
      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
      editingPostId ? updatePost() : createPost();
    }
  };

  return (
    <main>
      <div className='p-12'>
        <h1 className='text-3xl font-semibold'>Next.js CRUD App</h1>
        <div className="grid gap-2 py-6">
          <input
            className='px-4 py-2 rounded-md text-black focus:outline-0 border-0'
            type="text"
            placeholder="Title"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              setTitleError(null); // Clear error when typing
            }}
            onKeyDown={handleKeyDown} // Add key down handler
          />
          {titleError && <p className="text-red-600">{titleError}</p>}
          <textarea
            className='px-4 py-2 rounded-md text-black focus:outline-0 border-0'
            placeholder="Content"
            value={content}
            onChange={(e) => {
              setContent(e.target.value);
              setContentError(null); // Clear error when typing
            }}
            onKeyDown={handleKeyDown} // Add key down handler
          />
          {contentError && <p className="text-red-600">{contentError}</p>}
          <button
            className='bg-green-600 px-4 py-2 rounded-md focus:outline-0 border-0'
            onClick={editingPostId ? updatePost : createPost}
          >
            {editingPostId ? 'Update Post' : 'Create Post'}
          </button>
        </div>
        <div className='grid grid-cols-3 gap-2'>
          {loading ? (
            <h1>Loading...</h1>
          ) : (
            posts.length > 0 ? (
              posts.map((post) => (
                <div key={post.id} className='bg-slate-900 px-6 py-4 rounded-md'>
                  <h2 className='text-2xl font-semibold'>{post.title} {post.published ? '✔' : '❔'}</h2>
                  <p>{post.content}</p>
                  <div className="flex gap-2 pt-4">
                    <button className='bg-cyan-600 px-4 py-2 rounded-md focus:outline-0 border-0' onClick={() => togglePublish(post.id, post.published)}>
                      {post.published ? 'Unpublished' : 'Publish'}
                    </button>
                    <button className='bg-red-600 px-4 py-2 rounded-md focus:outline-0 border-0' onClick={() => deletePost(post.id)}>Delete</button>
                    <button className='bg-yellow-600 px-4 py-2 rounded-md focus:outline-0 border-0' onClick={() => startEditing(post)}>Edit</button>
                  </div>
                </div>
              ))
            ) : (
              <div>
                <h1 className='text-gray-400'>No posts found.</h1>
              </div>
            )
          )}
        </div>
      </div>
    </main>
  );
}
