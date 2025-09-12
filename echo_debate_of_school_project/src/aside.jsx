{/* Aside */}
function Aside({ categories, trendingTopics }) {
    return (
        <aside className="sidebar">
            <div className="sidebar-section">
                <h3>分類</h3>
                <ul className="sidebar-menu">
                    {categories.map((category) => (
                        <li key={category}>
                            <a href="#" className="sidebar-link">{category}</a>
                        </li>
                    ))}
                </ul>
            </div>
            <div className="sidebar-section">
                <h3>熱門話題</h3>
                <ul className="sidebar-menu">
                    {trendingTopics.map((topic) => (
                        <li key={topic}>
                            <a href="#" className="sidebar-link">{topic}</a>
                        </li>
                    ))}
                </ul>
            </div>
        </aside>
    )
}

export default Aside