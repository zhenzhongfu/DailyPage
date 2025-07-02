"use client"

import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ExternalLink, Calendar, User, Loader2, AlertCircle, ChevronDown, ChevronUp } from "lucide-react"
import { useState, useEffect, useRef, useCallback } from "react"
import type { ContentItem } from "./types/content"
import ReactMarkdown from 'react-markdown'
import { ThemeToggle } from "@/components/theme-toggle"
import React from "react"

// 添加一个函数来获取日期标签
const getDateLabel = (timestamp: number): string => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  
  const date = new Date(timestamp);
  date.setHours(0, 0, 0, 0);
  
  if (date.getTime() === today.getTime()) {
    return "今日";
  } else if (date.getTime() === yesterday.getTime()) {
    return "昨日";
  } else {
    // 检查是否是当前年份
    const isCurrentYear = date.getFullYear() === today.getFullYear();
    
    if (isCurrentYear) {
      // 如果是当前年份，只显示月日
      return new Date(timestamp).toLocaleDateString("zh-CN", {
        month: "long",
        day: "numeric",
      });
    } else {
      // 如果不是当前年份，显示年月日
      return new Date(timestamp).toLocaleDateString("zh-CN", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    }
  }
}

// 时间线日期项组件
interface TimelineDateItemProps {
  dateLabel: string;
  items: ContentItem[];
  isActive: boolean;
  onDateClick: (dateLabel: string) => void;
}

const TimelineDateItem = ({ dateLabel, items, isActive, onDateClick }: TimelineDateItemProps) => {
  const colorClass = dateLabel === "今日" 
    ? "bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-500 ring-blue-200 dark:ring-blue-800" 
    : dateLabel === "昨日" 
      ? "bg-purple-500 hover:bg-purple-600 dark:bg-purple-600 dark:hover:bg-purple-500 ring-purple-200 dark:ring-purple-800"
      : "bg-gray-500 hover:bg-gray-600 dark:bg-gray-600 dark:hover:bg-gray-500 ring-gray-200 dark:ring-gray-700";

  return (
    <div className="flex flex-col items-center w-full">
      <button
        onClick={() => onDateClick(dateLabel)}
        className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-medium transition-all hover:scale-110 ${isActive ? 'scale-110 shadow-lg ring-4' : 'ring-2'} ${colorClass}`}
        title={`${dateLabel} (${items.length}条)`}
      >
        {dateLabel === "今日" || dateLabel === "昨日" 
          ? dateLabel.substring(0, 1) 
          : dateLabel.includes("年") 
            ? dateLabel.split("年")[1].split("月")[1].replace("日", "")
            : dateLabel.split("月")[1].replace("日", "")}
      </button>
      <span className="text-[10px] text-gray-600 dark:text-gray-400 mt-1 text-center">
        {dateLabel === "今日" || dateLabel === "昨日" 
          ? dateLabel
          : (() => {
              // 处理年月日格式
              if (dateLabel.includes("年")) {
                // 包含年份的情况
                const yearParts = dateLabel.split('年');
                const year = yearParts[0] + '年';
                const restParts = yearParts[1].split('月');
                const month = restParts[0] + '月';
                const day = restParts[1];
                return (
                  <>
                    <div>{year}</div>
                    <div>{month}</div>
                    <div>{day}</div>
                  </>
                );
              } else {
                // 只有月日的情况
                const dateParts = dateLabel.split('月');
                const month = dateParts[0] + '月';
                const day = dateParts[1];
                return (
                  <>
                    <div>{month}</div>
                    <div>{day}</div>
                  </>
                );
              }
            })()}
      </span>
    </div>
  );
};



// 日历导航项组件 - 根据用户截图调整
interface CalendarDateItemProps {
  dateLabel: string;
  items: ContentItem[];
  isActive: boolean;
  onDateClick: (dateLabel: string) => void;
}

const CalendarDateItem = ({ dateLabel, items, isActive, onDateClick }: CalendarDateItemProps) => {
  // 提取日期信息
  let displayDay: string;
  let displayDate: string;
  let contentCount: string = `${items.length}条内容`;
  
  if (dateLabel === "今日") {
    displayDay = "今";
    displayDate = "今日";
  } else if (dateLabel === "昨日") {
    displayDay = "昨";
    displayDate = "昨日";
    contentCount = `${items.length}条内容`;
  } else if (dateLabel.includes("年")) {
    // 2023年6月15日
    const yearParts = dateLabel.split('年');
    const restParts = yearParts[1].split('月');
    const month = restParts[0];
    const day = restParts[1].replace('日', '');
    displayDay = day;
    displayDate = `${month}月${day}日`;
  } else {
    // 6月15日
    const dateParts = dateLabel.split('月');
    const month = dateParts[0];
    const day = dateParts[1].replace('日', '');
    displayDay = day;
    displayDate = `${month}月${day}日`;
  }
  
  // 根据内容数量和日期类型设置颜色
  const getSquareColor = () => {
    if (dateLabel === "今日") return "bg-blue-500";
    if (dateLabel === "昨日") return "bg-purple-500";
    
    // 根据内容数量设置颜色强度
    if (items.length >= 10) return "bg-green-600";
    if (items.length >= 5) return "bg-green-500";
    if (items.length >= 2) return "bg-green-400";
    return "bg-green-300";
  };
  
  return (
    <div className={`mb-2 flex items-center gap-3 ${isActive ? 'opacity-100' : 'opacity-90'}`}>
      <div 
        onClick={() => onDateClick(dateLabel)}
        className={`w-12 h-12 flex items-center justify-center rounded-md transition-all cursor-pointer
          ${getSquareColor()} text-white text-xl font-medium
          ${isActive ? 'ring-2 ring-white' : ''}
          hover:brightness-110`}
        title={`${dateLabel} (${items.length}条内容)`}
      >
        {displayDay}
      </div>
      
      <div className="flex flex-col text-left">
        <div className="text-sm font-medium text-gray-200">
          {displayDate}
        </div>
        <div className="text-xs text-gray-400">
          {contentCount}
        </div>
      </div>
    </div>
  );
};

const markdownComponents = {
  p: ({node: _node, ...props}: {node?: any, [key: string]: any}) => (
    <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-[15px] px-1 py-0.5 mb-1" {...props} />
  ),
  ul: ({node: _node, ...props}: {node?: any, [key: string]: any}) => (
    <ul className="list-disc pl-5 mb-1" {...props} />
  ),
  ol: ({node: _node, ...props}: {node?: any, [key: string]: any}) => (
    <ol className="list-decimal pl-5 mb-1" {...props} />
  ),
  li: ({node: _node, ...props}: {node?: any, [key: string]: any}) => (
    <li className="mb-0.5" {...props} />
  ),
  a: ({node: _node, ...props}: {node?: any, [key: string]: any}) => (
    <a className="text-blue-600 dark:text-blue-400 hover:underline break-all" target="_blank" rel="noopener noreferrer" {...props} />
  ),
  code: ({node: _node, ...props}: {node?: any, [key: string]: any}) => (
    <code className="bg-gray-100 dark:bg-gray-800 rounded px-1 py-0.5 text-sm" {...props} />
  ),
};

export default function Component() {
  const [contentData, setContentData] = useState<ContentItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedTag, setSelectedTag] = useState<string | null>(null)
  const [visibleItems, setVisibleItems] = useState<number>(12); // 初始显示的内容数量
  const [hasMore, setHasMore] = useState<boolean>(true); // 是否还有更多内容
  const [loadingMore, setLoadingMore] = useState<boolean>(false); // 是否正在加载更多
  const loadMoreRef = useRef<HTMLDivElement>(null); // 用于监测滚动位置的ref
  const ITEMS_PER_LOAD = 9; // 每次加载的内容数量
  const [activeDate, setActiveDate] = useState<string | null>(null); // 当前可见的日期组
  const [expandedCards, setExpandedCards] = useState<Record<string, boolean>>({});

  const toggleCardExpansion = (recordId: string) => {
    setExpandedCards(prev => ({ ...prev, [recordId]: !prev[recordId] }));
  };

  // 从JSON文件加载数据
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        const response = await fetch("/content-data.json")
        if (!response.ok) {
          throw new Error("Failed to load content data")
        }
        const data: ContentItem[] = await response.json()
        
        // 按发布时间从新到旧排序
        const sortedData = [...data].sort((a, b) => b.fields.发布时间 - a.fields.发布时间)
        setContentData(sortedData)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error occurred")
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  // 获取所有标签
  const allTags = Array.from(new Set(contentData.flatMap((item) => item.fields.标签 || [])))

  // 过滤内容
  const filteredContent = selectedTag
    ? contentData.filter((item) => item.fields.标签?.includes(selectedTag))
    : contentData
    
  // 加载更多内容
  const loadMoreItems = useCallback(() => {
    if (loadingMore || !hasMore) return;
    
    setLoadingMore(true);
    // 模拟加载延迟
    setTimeout(() => {
      setVisibleItems(prev => {
        const newValue = prev + ITEMS_PER_LOAD;
        // 检查是否还有更多内容
        if (newValue >= filteredContent.length) {
          setHasMore(false);
        }
        return Math.min(newValue, filteredContent.length);
      });
      setLoadingMore(false);
    }, 300);
  }, [loadingMore, hasMore, filteredContent.length]);

  // 监听滚动，实现无限滚动
  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && hasMore && !loadingMore) {
          loadMoreItems();
        }
      },
      { threshold: 0.1 }
    );
    
    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current);
    }
    
    return () => observer.disconnect();
  }, [hasMore, loadingMore, loadMoreItems]);

  // 当过滤条件改变时，重置懒加载状态
  useEffect(() => {
    setVisibleItems(12);
    setHasMore(true);
  }, [selectedTag]);

  // 格式化时间
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString("zh-CN", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  // 将内容按日期分组
  const groupContentByDate = () => {
    const result: { [key: string]: ContentItem[] } = {};
    const visibleContent = filteredContent.slice(0, visibleItems);
    
    visibleContent.forEach(item => {
      const date = new Date(item.fields.发布时间);
      date.setHours(0, 0, 0, 0);
      
      // 获取日期标签（今日、昨日或具体日期）
      const dateKey = getDateLabel(item.fields.发布时间);
      
      if (!result[dateKey]) {
        result[dateKey] = [];
      }
      
      result[dateKey].push(item);
    });
    
    return result;
  };
  
  // 获取日期组的样式
  const getDateGroupStyle = (dateLabel: string) => {
    if (dateLabel === "今日") {
      return {
        header: "bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-l-4 border-blue-500",
        card: "border-l-2 border-l-blue-300 dark:border-l-blue-700"
      };
    } else if (dateLabel === "昨日") {
      return {
        header: "bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border-l-4 border-purple-500",
        card: "border-l-2 border-l-purple-300 dark:border-l-purple-700"
      };
    } else {
      return {
        header: "bg-gray-50 dark:bg-gray-900/60 text-gray-700 dark:text-gray-300 border-l-4 border-gray-500",
        card: ""
      };
    }
  };
  
  // 按日期分组的内容
  const groupedContent = groupContentByDate();
  
  // 获取时间线显示的日期组
  const getTimelineDates = () => {
    const dateEntries = Object.entries(groupedContent);
    
    // 显示所有日期，不再省略
    return { 
      dates: dateEntries,
      hasGap: false
    };
  };

  // 处理文本中的URL，使其可点击
  const processTextWithLinks = (text: string) => {
    // URL正则表达式
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    
    // 如果文本中没有URL也没有换行符，直接返回原文本
    if (!urlRegex.test(text) && !text.includes('\n')) {
      return <span>{text}</span>;
    }
    
    // 处理换行符
    const handleNewlines = (content: string | React.ReactNode) => {
      if (typeof content !== 'string') {
        return content;
      }
      
      return content.split('\n').map((line, i, array) => (
        <React.Fragment key={i}>
          {line}
          {i < array.length - 1 && <br />}
        </React.Fragment>
      ));
    };
    
    // 如果只有换行符没有URL
    if (!urlRegex.test(text)) {
      return handleNewlines(text);
    }
    
    // 将文本分割成URL和非URL部分
    const parts = text.split(urlRegex);
    const matches = text.match(urlRegex) || [];
    
    return (
      <>
        {parts.map((part, i) => {
          // 偶数索引是文本，奇数索引是URL
          if (i % 2 === 0) {
            return handleNewlines(part);
          } else {
            const url = matches[(i - 1) / 2];
            return (
              <a 
                key={i}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 dark:text-blue-400 hover:underline break-all"
              >
                {url}
              </a>
            );
          }
        })}
      </>
    );
  };

  // 滚动到指定日期分组
  const scrollToDateGroup = (dateLabel: string) => {
    const element = document.getElementById(`date-group-${dateLabel}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // 监听滚动，更新当前可见的日期组
  useEffect(() => {
    const handleScroll = () => {
      const dateGroups = Object.keys(groupedContent).map(dateLabel => ({
        dateLabel,
        element: document.getElementById(`date-group-${dateLabel}`)
      }));

      // 找到当前可见的日期组
      for (const {dateLabel, element} of dateGroups) {
        if (!element) continue;
        
        const rect = element.getBoundingClientRect();
        // 如果元素在视口中或刚刚离开顶部
        if (rect.top <= 100 && rect.bottom >= 0) {
          setActiveDate(dateLabel);
          break;
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    // 初始化时执行一次
    handleScroll();
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [groupedContent]);

  // 获取平台颜色
  const getPlatformColor = (platform: string) => {
    switch (platform) {
      case "X":
        return "bg-black text-white dark:bg-white dark:text-black"
      default:
        return "bg-gray-500 text-white dark:bg-gray-400 dark:text-gray-900"
    }
  }

  // 获取标签颜色
  const getTagColor = (tag: string) => {
    const colors = {
      工具: "bg-blue-100 text-blue-800 hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-200 dark:hover:bg-blue-800",
      AI: "bg-purple-100 text-purple-800 hover:bg-purple-200 dark:bg-purple-900 dark:text-purple-200 dark:hover:bg-purple-800",
      文章: "bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-900 dark:text-green-200 dark:hover:bg-green-800",
      思考: "bg-orange-100 text-orange-800 hover:bg-orange-200 dark:bg-orange-900 dark:text-orange-200 dark:hover:bg-orange-800",
    }
    return colors[tag as keyof typeof colors] || "bg-gray-100 text-gray-800 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
  }

  // 加载状态
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-gray-600 dark:text-gray-400" />
          <p className="text-gray-600 dark:text-gray-400">正在加载内容...</p>
        </div>
      </div>
    )
  }

  // 错误状态
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-8 h-8 mx-auto mb-4 text-red-500" />
          <p className="text-red-600 dark:text-red-400 mb-4">加载数据时出错：{error}</p>
          <Button onClick={() => window.location.reload()}>重新加载</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* 页面标题和主题切换 */}
        <div className="flex items-center justify-between mb-4">
          <div className="text-center flex-1">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">内容展示</h1>
            <p className="text-lg text-gray-600 dark:text-gray-400">精选内容合集，发现有价值的信息</p>
          </div>
          <div className="absolute top-4 right-4 md:top-8 md:right-8">
            <ThemeToggle />
          </div>
        </div>

        {/* 标签过滤器 */}
        {allTags.length > 0 && (
          <div className="mb-6">
            <div className="flex flex-wrap gap-1.5 justify-center">
              <Button
                variant={selectedTag === null ? "default" : "outline"}
                onClick={() => setSelectedTag(null)}
                className="rounded-full text-sm h-8 px-3"
              >
                全部
              </Button>
              {allTags.map((tag) => (
                <Button
                  key={tag}
                  variant={selectedTag === tag ? "default" : "outline"}
                  onClick={() => setSelectedTag(tag)}
                  className={`rounded-full text-sm h-8 px-3 ${selectedTag === tag ? "" : getTagColor(tag)}`}
                >
                  {tag}
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* 内容网格 - 按日期分组显示 */}
        {filteredContent.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400 text-lg">暂无内容</p>
          </div>
        ) : (
          <>
            <div className="relative flex gap-4 max-w-4xl mx-auto">
              {/* 主内容区域 */}
              <div className="flex flex-col gap-6 flex-1">
                {Object.entries(groupedContent).map(([dateLabel, items]) => (
                  <div id={`date-group-${dateLabel}`} key={dateLabel} className="flex flex-col gap-2.5">
                    {/* 日期标题 */}
                    <div className={`sticky top-0 z-10 flex items-center gap-2 py-2 px-3 mb-1 rounded-lg backdrop-blur-sm ${getDateGroupStyle(dateLabel).header}`}>
                      <Calendar className="w-4 h-4" />
                      <h3 className="text-sm font-medium">{dateLabel}</h3>
                      <span className="text-xs opacity-75">({items.length}条)</span>
                    </div>
                    
                    {/* 该日期下的内容卡片 */}
                    {items.map((item) => (
                      <Card
                        key={item.record_id}
                        className={`bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm hover:shadow transition-shadow duration-200 rounded-lg p-1.5 border border-gray-100 dark:border-gray-700 ${getDateGroupStyle(dateLabel).card}`}
                        style={{ boxShadow: '0 1px 4px 0 rgba(0,0,0,0.04)' }}
                      >
                        <CardHeader className="space-y-1.5 p-2.5 pb-1.5">
                          {/* 平台、作者和时间 */}
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-1.5">
                              {item.fields.平台?.map((platform) => (
                                <Badge key={platform} className={`${getPlatformColor(platform)} rounded-full text-xs py-0 px-2`}>
                                  {platform}
                                </Badge>
                              ))}
                              <div className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-300">
                                <User className="w-3 h-3" />
                                <a
                                  href={item.fields.账号.link}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium"
                                >
                                  {item.fields.账号.text}
                                </a>
                              </div>
                            </div>
                            <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
                              <Calendar className="w-3 h-3" />
                              {formatDate(item.fields.发布时间)}
                            </div>
                          </div>

                          {/* 标签 */}
                          {item.fields.标签 && item.fields.标签.length > 0 && (
                            <div className="flex flex-wrap gap-1.5">
                              {item.fields.标签.map((tag) => (
                                <Badge
                                  key={tag}
                                  variant="secondary"
                                  className={`${getTagColor(tag)} cursor-pointer rounded-full text-xs py-0 px-2`}
                                  onClick={() => setSelectedTag(tag)}
                                >
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </CardHeader>

                        <CardContent className="space-y-1.5 pt-0 p-2.5">
                          {/* 正文内容 */}
                          {item.fields.正文 && item.fields.正文.length > 0 && (
                            <div>
                              {(() => {
                                const totalTextLength = item.fields.正文.reduce((acc, curr) => acc + curr.text.length, 0);
                                const isLongText = totalTextLength > 300;
                                const isExpanded = expandedCards[item.record_id];

                                return (
                                  <>
                                    <div className={`relative ${isLongText && !isExpanded ? 'max-h-40 overflow-hidden' : ''}`}>
                                      {item.fields.正文.map((content, index) => {
                                        const hasMarkdown = /[*#\[\]_~`>]/.test(content.text);
                                        return hasMarkdown ? (
                                          <ReactMarkdown key={index} components={markdownComponents}>
                                            {content.text}
                                          </ReactMarkdown>
                                        ) : (
                                          <div key={index} className="text-gray-700 dark:text-gray-300 leading-relaxed text-[15px] px-1 py-0.5 mb-1">
                                            {processTextWithLinks(content.text)}
                                          </div>
                                        );
                                      })}
                                      {isLongText && !isExpanded && (
                                          <div className="absolute bottom-0 left-0 w-full h-12 bg-gradient-to-t from-white dark:from-gray-800 to-transparent"></div>
                                      )}
                                    </div>
                                    {isLongText && (
                                      <div className="text-right mt-1">
                                        <Button variant="link" size="sm" onClick={() => toggleCardExpansion(item.record_id)} className="text-blue-600 dark:text-blue-400 h-auto p-0 text-xs flex items-center gap-1">
                                          {isExpanded ? (
                                            <>
                                              收起 <ChevronUp className="w-3 h-3" />
                                            </>
                                          ) : (
                                            <>
                                              展开全文 <ChevronDown className="w-3 h-3" />
                                            </>
                                          )}
                                        </Button>
                                      </div>
                                    )}
                                  </>
                                )
                              })()}
                            </div>
                          )}

                          {/* 链接 */}
                          {item.fields.链接 && item.fields.链接.length > 0 && (
                            <div className="flex justify-end mt-1">
                              {item.fields.链接.map((link, index) => (
                                <a
                                  key={index}
                                  href={typeof link === "string" ? link : link.link || link.text}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-0.5 text-xs text-blue-600 dark:text-blue-400 hover:underline"
                                >
                                  <ExternalLink className="w-3 h-3" />
                                  查看原文
                                </a>
                              ))}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ))}
              </div>
              
              {/* 右侧日历导航 - 根据用户截图调整 */}
              <div className="hidden md:block w-40 sticky top-4 self-start h-auto max-h-[calc(100vh-8rem)] overflow-y-auto">
                <div className="bg-gray-900 p-3 rounded-lg flex flex-col">
                  <div className="text-sm font-medium text-white mb-2 pb-2 border-b border-gray-700 flex items-center justify-between">
                    <span>日期导航</span>
                    <div className="flex items-center gap-1">
                      <span className="text-[10px] text-gray-400">少</span>
                      <div className="w-3 h-3 rounded-sm bg-green-300"></div>
                      <div className="w-3 h-3 rounded-sm bg-green-400"></div>
                      <div className="w-3 h-3 rounded-sm bg-green-500"></div>
                      <div className="w-3 h-3 rounded-sm bg-green-600"></div>
                      <span className="text-[10px] text-gray-400">多</span>
                    </div>
                  </div>
                  <div className="flex flex-col">
                      {getTimelineDates().dates.map(([dateLabel, items]) => (
                        <CalendarDateItem 
                          key={dateLabel}
                          dateLabel={dateLabel} 
                          items={items} 
                          isActive={activeDate === dateLabel}
                          onDateClick={scrollToDateGroup}
                        />
                      ))}
                  </div>
                </div>
              </div>
            </div>
            
            {/* 加载更多内容区域 */}
            {hasMore && (
              <div 
                ref={loadMoreRef} 
                className="flex justify-center mt-8 pb-4"
              >
                <Button
                  variant="outline"
                  onClick={loadMoreItems}
                  disabled={loadingMore}
                  className="flex items-center gap-2"
                >
                  {loadingMore ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      加载中...
                    </>
                  ) : (
                    <>
                      <ChevronDown className="w-4 h-4" />
                      加载更多
                    </>
                  )}
                </Button>
              </div>
            )}
          </>
        )}

        {/* 统计信息 */}
        <div className="mt-8 text-center">
          <div className="inline-flex items-center gap-3 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-full px-4 py-2 shadow-sm dark:shadow-gray-900/20 text-xs">
            <span className="text-gray-600 dark:text-gray-300">共 {contentData.length} 条内容</span>
            <span className="text-gray-400 dark:text-gray-500">|</span>
            <span className="text-gray-600 dark:text-gray-300">
              {selectedTag ? `${filteredContent.length} 条「${selectedTag}」相关` : "显示全部"}
            </span>
            {visibleItems < filteredContent.length && (
              <>
                <span className="text-gray-400 dark:text-gray-500">|</span>
                <span className="text-gray-600 dark:text-gray-300">
                  当前已加载 {Math.min(visibleItems, filteredContent.length)} 条
                </span>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

