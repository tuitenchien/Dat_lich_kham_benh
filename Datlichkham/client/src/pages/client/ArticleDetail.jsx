import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Calendar, User, Eye, ChevronLeft, Tag } from "lucide-react";
import { apiClient } from "../../config/axiosClient";
import dayjs from "dayjs";

export default function ArticleDetail() {
    const { slug } = useParams();
    const [article, setArticle] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchArticle = async () => {
            try {
                const res = await apiClient.get(`/api/articles/${slug}`);
                if (res.data.metadata) {
                    setArticle(res.data.metadata);
                }
            } catch (error) {
                console.error("Lỗi khi tải bài viết", error);
            } finally {
                setLoading(false);
            }
        };

        fetchArticle();
        window.scrollTo(0, 0);
    }, [slug]);

    if (loading) {
        return (
            <div className="bg-white min-h-screen pt-24 pb-20 flex justify-center">
                <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mt-20"></div>
            </div>
        );
    }

    if (!article) {
        return (
            <div className="bg-white min-h-screen pt-24 pb-20 text-center">
                <h1 className="text-2xl font-bold mt-20">Không tìm thấy bài viết!</h1>
                <Link to="/tin-tuc" className="text-primary-600 mt-4 inline-block hover:underline">Quay lại trang tin tức</Link>
            </div>
        );
    }

    return (
        <div className="bg-gray-50 min-h-screen pt-24 pb-20">
            <div className="max-w-4xl mx-auto px-4">
                <Link to="/tin-tuc" className="inline-flex items-center text-primary-600 font-medium mb-8 hover:text-primary-700 transition-colors bg-primary-50 px-4 py-2 rounded-full text-sm">
                    <ChevronLeft size={16} className="mr-1" />
                    Quay lại Kiến thức y khoa
                </Link>

                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                    {article.thumbnail && (
                        <div className="w-full h-[400px]">
                            <img src={article.thumbnail} alt={article.title} className="w-full h-full object-cover" />
                        </div>
                    )}
                    
                    <div className="p-8 md:p-12">
                        {article.tags && article.tags.length > 0 && (
                            <div className="flex flex-wrap gap-2 mb-6">
                                {article.tags.map(tag => (
                                    <span key={tag} className="flex items-center text-xs font-bold bg-primary-50 text-primary-600 px-3 py-1.5 rounded-full">
                                        <Tag size={12} className="mr-1" /> {tag}
                                    </span>
                                ))}
                            </div>
                        )}

                        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 leading-tight mb-6">
                            {article.title}
                        </h1>

                        <div className="flex flex-wrap items-center gap-6 py-4 border-y border-gray-100 mb-8 text-sm text-gray-600 font-medium">
                            <div className="flex items-center gap-2">
                                <div className="w-10 h-10 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center overflow-hidden">
                                    {article.authorId?.avatar ? (
                                        <img src={article.authorId.avatar} alt="" className="w-full h-full object-cover" />
                                    ) : (
                                        <User size={20} />
                                    )}
                                </div>
                                <div>
                                    <p className="text-gray-900 font-bold">{article.authorId?.fullName || 'Bác sĩ'}</p>
                                    <p className="text-xs text-gray-500">{article.authorId?.role === 'doctor' ? 'Chuyên gia Y tế' : 'Ban Biên tập'}</p>
                                </div>
                            </div>
                            
                            <div className="flex items-center gap-4 ml-auto">
                                <span className="flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-lg">
                                    <Calendar size={16} className="text-gray-400" />
                                    {dayjs(article.createdAt).format('DD/MM/YYYY')}
                                </span>
                                <span className="flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-lg">
                                    <Eye size={16} className="text-gray-400" />
                                    {article.views} lượt xem
                                </span>
                            </div>
                        </div>

                        <div 
                            className="prose prose-lg max-w-none prose-headings:text-gray-900 prose-a:text-primary-600 hover:prose-a:text-primary-700 prose-img:rounded-2xl"
                            dangerouslySetInnerHTML={{ __html: article.content }}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
