import { ExternalLink, Newspaper } from "lucide-react";

interface NewsItem {
  id: string;
  title: string;
  source: string;
  thumbnail: string;
  url: string;
}

const mockNews: NewsItem[] = [
  {
    id: "1",
    title: "2024년 AI 트렌드: 생성형 AI가 바꾸는 업무 환경",
    source: "테크뉴스",
    thumbnail: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=200&h=120&fit=crop",
    url: "#",
  },
  {
    id: "2",
    title: "클라우드 보안 강화를 위한 5가지 전략",
    source: "IT조선",
    thumbnail: "https://images.unsplash.com/photo-1563986768609-322da13575f3?w=200&h=120&fit=crop",
    url: "#",
  },
  {
    id: "3",
    title: "리액트 19 새로운 기능 미리보기",
    source: "개발자뉴스",
    thumbnail: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=200&h=120&fit=crop",
    url: "#",
  },
];

const InterestNews = () => {
  return (
    <div className="bg-card rounded-2xl p-4 shadow-soft h-full flex flex-col">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-7 h-7 rounded-lg bg-orange-100 flex items-center justify-center">
          <Newspaper className="w-4 h-4 text-orange-600" />
        </div>
        <h2 className="text-base font-bold text-foreground">관심 뉴스</h2>
      </div>

      <div className="flex-1 space-y-3 overflow-auto min-h-0">
        {mockNews.map((news) => (
          <a
            key={news.id}
            href={news.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex gap-3 p-2 rounded-xl hover:bg-muted/50 transition-all group"
          >
            <img
              src={news.thumbnail}
              alt={news.title}
              className="w-20 h-14 rounded-lg object-cover shrink-0"
            />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-foreground line-clamp-2 group-hover:text-primary transition-colors leading-relaxed">
                {news.title}
              </p>
              <div className="flex items-center gap-1.5 mt-1.5">
                <span className="text-[10px] text-muted-foreground">{news.source}</span>
                <ExternalLink className="w-3 h-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
};

export default InterestNews;
