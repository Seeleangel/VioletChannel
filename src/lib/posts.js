import fs from 'fs';
import path from 'path';

// Use a file outside src or in data to persist.
// In Next.js dev, writing to src might trigger reload loop if not careful.
// Storing in a separate 'data' folder at root is better.
const dataDirectory = path.join(process.cwd(), 'data');
const postsFile = path.join(dataDirectory, 'posts.json');

export function getPosts() {
    if (!fs.existsSync(dataDirectory)) {
        fs.mkdirSync(dataDirectory, { recursive: true });
    }
    if (!fs.existsSync(postsFile)) {
        // Initial mock data
        const initialData = [
            {
                id: 1,
                title: '我的 2024 年终总结',
                excerpt: '回顾这一年，从技术的精进到生活的感悟，无论是代码行的积累还是旅途中的风景...',
                content: `
              ## 回顾 2024

              2024年对我来说是充满变化和挑战的一年。

              ### 技术成长
              - 熟练掌握了 React Hooks
              - 学习了 Next.js
              
              ### 生活感悟
              生活不仅是眼前的苟且，还有诗和远方。
            `,
                date: '2024-12-31',
                category: '生活感悟',
                image: 'https://images.unsplash.com/photo-1499750310159-5254f4127278?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'
            }
        ];
        fs.writeFileSync(postsFile, JSON.stringify(initialData, null, 2));
        return initialData;
    }
    const fileContents = fs.readFileSync(postsFile, 'utf8');
    return JSON.parse(fileContents);
}

export function savePost(post) {
    const posts = getPosts();
    const newPost = { ...post, id: Date.now() }; // Simple ID generation
    posts.unshift(newPost);
    fs.writeFileSync(postsFile, JSON.stringify(posts, null, 2));
    return newPost;
}

export function getPostById(id) {
    const posts = getPosts();
    return posts.find(p => p.id.toString() === id.toString());
}

export function updatePost(id, updatedData) {
    const posts = getPosts();
    const index = posts.findIndex(p => p.id.toString() === id.toString());
    if (index === -1) return null;

    posts[index] = { ...posts[index], ...updatedData, id: posts[index].id }; // Preserve original ID
    fs.writeFileSync(postsFile, JSON.stringify(posts, null, 2));
    return posts[index];
}

export function deletePost(id) {
    const posts = getPosts();
    const index = posts.findIndex(p => p.id.toString() === id.toString());
    if (index === -1) return false;

    posts.splice(index, 1);
    fs.writeFileSync(postsFile, JSON.stringify(posts, null, 2));
    return true;
}
