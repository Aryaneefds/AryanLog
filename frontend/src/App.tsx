import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './lib/auth';
import { Home } from './pages/Home';
import { PostPage } from './pages/Post';
import { IdeaPage } from './pages/Idea';
import { Ideas } from './pages/Ideas';
import { Threads } from './pages/Threads';
import { ThreadPage } from './pages/Thread';
import { Archive } from './pages/Archive';
import { NotFound } from './pages/NotFound';
import { Login, Dashboard, PostList, PostEditor, IdeaList, ThreadList } from './pages/admin';
import './styles/globals.css';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Home />} />
          <Route path="/posts/:slug" element={<PostPage />} />
          <Route path="/ideas" element={<Ideas />} />
          <Route path="/ideas/:slug" element={<IdeaPage />} />
          <Route path="/threads" element={<Threads />} />
          <Route path="/threads/:slug" element={<ThreadPage />} />
          <Route path="/archive" element={<Archive />} />

          {/* Admin routes */}
          <Route path="/admin/login" element={<Login />} />
          <Route path="/admin" element={<Dashboard />} />
          <Route path="/admin/posts" element={<PostList />} />
          <Route path="/admin/posts/:id" element={<PostEditor />} />
          <Route path="/admin/ideas" element={<IdeaList />} />
          <Route path="/admin/threads" element={<ThreadList />} />

          {/* 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
