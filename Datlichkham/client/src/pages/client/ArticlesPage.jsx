import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Calendar, User, Eye, Search } from "lucide-react";
import { apiClient } from "../../config/axiosClient";
import dayjs from "dayjs";

export default function ArticlesPage() {
    const [articles, setArticles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        fetchArticles();
    }, []);

    const fetchArticles = async (search = "") => {
        setLoading(true);
        try {
            const res = await apiClient.get(`/api/articles?status=published&search=${search}`);
            if (res.data.metadata?.articles) {
                setArticles(res.data.metadata.articles);
            }
        } catch (error) {
            console.error("Lỗi khi tải bài viết", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        fetchArticles(searchTerm);
    };

    return (
        <div className="bg-gray-50 min-h-screen pt-24 pb-20">
            <div className="container mx-auto px-4 max-w-6xl">
                <div className="text-center mb-12 animate-fade-in">
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">Cẩm nang Sức khỏe</h1>
                    <p className="text-gray-600 text-lg max-w-2xl mx-auto">
                        Cập nhật những kiến thức y khoa, tin tức sức khỏe mới nhất từ đội ngũ bác sĩ chuyên gia của chúng tôi.
                    </p>
                </div>

                <div className="flex justify-center mb-12">
                    <form onSubmit={handleSearch} className="relative w-full max-w-lg">
                        <input
                            type="text"
                            placeholder="Tìm kiếm bài viết..."
                            className="w-full bg-white border border-gray-200 text-gray-900 px-5 py-4 pl-12 rounded-full focus:outline-none focus:ring-2 focus:ring-primary-500 shadow-sm transition-all"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <button 
                            type="submit"
                            className="absolute right-2 top-1/2 -translate-y-1/2 bg-primary-600 text-white px-6 py-2 rounded-full font-medium hover:bg-primary-700 transition-colors"
                        >
                            Tìm
                        </button>
                    </form>
                </div>

                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {[1, 2, 3, 4, 5, 6].map(i => (
                            <div key={i} className="bg-white rounded-3xl overflow-hidden shadow-sm animate-pulse">
                                <div className="h-48 bg-gray-200"></div>
                                <div className="p-6 space-y-4">
                                    <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                                    <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                                    <div className="h-4 bg-gray-200 rounded w-full"></div>
                                    <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : articles.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {articles.map((article) => (
                            <Link 
                                to={`/tin-tuc/${article.slug}`} 
                                key={article._id}
                                className="group bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 flex flex-col"
                            >
                                <div className="relative h-56 overflow-hidden">
                                    <img 
                                        src={article.thumbnail} 
                                        alt={article.title}
                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                    />
                                    {article.tags && article.tags[0] && (
                                        <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm text-primary-600 text-xs font-bold px-3 py-1.5 rounded-full">
                                            {article.tags[0]}
                                        </div>
                                    )}
                                </div>
                                <div className="p-6 flex-1 flex flex-col">
                                    <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-primary-600 transition-colors line-clamp-2">
                                        {article.title}
                                    </h3>
                                    
                                    <div className="mt-auto pt-4 border-t border-gray-50 flex items-center justify-between text-xs text-gray-500">
                                        <div className="flex items-center gap-4">
                                            <span className="flex items-center gap-1.5 font-medium">
                                                <User size={14} className="text-primary-500" />
                                                {article.authorId?.fullName || 'Bác sĩ'}
                                            </span>
                                            <span className="flex items-center gap-1.5">
                                                <Calendar size={14} />
                                                {dayjs(article.createdAt).format('DD/MM/YYYY')}
                                            </span>
                                        </div>
                                        <span className="flex items-center gap-1">
                                            <Eye size={14} /> {article.views}
                                        </span>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20">
                        <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
                            <Search size={40} />
                        </div>
                        <h3 className="text-xl font-bold text-gray-800">Không tìm thấy bài viết nào</h3>
                        <p className="text-gray-500 mt-2">Vui lòng thử lại với từ khóa khác.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
