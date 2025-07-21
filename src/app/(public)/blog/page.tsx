"use client";

import { useState } from "react";
import Link from "next/link";
import { Shield, ArrowLeft, Search, Calendar, Clock, User, ArrowRight, Tag } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Card } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Badge } from "~/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";

interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  author: string;
  date: string;
  readTime: number;
  category: string;
  tags: string[];
  featured: boolean;
}

export default function BlogPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const blogPosts: BlogPost[] = [
    {
      id: "vpn-protocols-2024",
      title: "Сравнение VPN протоколов в 2024 году: VLESS vs VMESS vs WireGuard",
      excerpt: "Подробный анализ современных VPN протоколов, их преимуществ и недостатков для разных сценариев использования.",
      content: "",
      author: "Алексей Петров",
      date: "2024-01-20",
      readTime: 8,
      category: "Технологии",
      tags: ["VLESS", "VMESS", "WireGuard", "Протоколы"],
      featured: true,
    },
    {
      id: "online-privacy-guide",
      title: "Полное руководство по защите приватности в интернете",
      excerpt: "Практические советы по защите личных данных онлайн: от выбора VPN до безопасного браузинга.",
      content: "",
      author: "Мария Иванова",
      date: "2024-01-15",
      readTime: 12,
      category: "Безопасность",
      tags: ["Приватность", "Безопасность", "Анонимность"],
      featured: true,
    },
    {
      id: "streaming-with-vpn",
      title: "Как смотреть стриминговые сервисы с VPN без блокировок",
      excerpt: "Секреты обхода гео-блокировок Netflix, YouTube и других популярных стриминговых платформ.",
      content: "",
      author: "Дмитрий Сидоров",
      date: "2024-01-12",
      readTime: 6,
      category: "Инструкции",
      tags: ["Стриминг", "Netflix", "Обход блокировок"],
      featured: false,
    },
    {
      id: "vpn-for-business",
      title: "VPN для бизнеса: корпоративная безопасность в 2024 году",
      excerpt: "Как выбрать и настроить VPN для удаленной работы команды. Обзор лучших решений для бизнеса.",
      content: "",
      author: "Елена Козлова",
      date: "2024-01-08",
      readTime: 10,
      category: "Бизнес",
      tags: ["Бизнес", "Корпоративный VPN", "Удаленная работа"],
      featured: false,
    },
    {
      id: "china-firewall-bypass",
      title: "Обход Великого китайского файрвола: актуальные методы",
      excerpt: "Современные способы доступа к заблокированным сайтам в Китае и других странах с интернет-цензурой.",
      content: "",
      author: "Алексей Петров",
      date: "2024-01-05",
      readTime: 15,
      category: "Обход блокировок",
      tags: ["Китай", "Цензура", "Файрвол"],
      featured: false,
    },
    {
      id: "router-vpn-setup",
      title: "Настройка VPN на роутере: пошаговое руководство",
      excerpt: "Как настроить VPN на домашнем роутере для защиты всех устройств в сети одновременно.",
      content: "",
      author: "Игорь Новиков",
      date: "2024-01-01",
      readTime: 20,
      category: "Инструкции",
      tags: ["Роутер", "Настройка", "Домашняя сеть"],
      featured: false,
    },
  ];

  const categories = [
    { id: "all", name: "Все статьи", count: blogPosts.length },
    { id: "Технологии", name: "Технологии", count: blogPosts.filter(p => p.category === "Технологии").length },
    { id: "Безопасность", name: "Безопасность", count: blogPosts.filter(p => p.category === "Безопасность").length },
    { id: "Инструкции", name: "Инструкции", count: blogPosts.filter(p => p.category === "Инструкции").length },
    { id: "Бизнес", name: "Бизнес", count: blogPosts.filter(p => p.category === "Бизнес").length },
    { id: "Обход блокировок", name: "Обход блокировок", count: blogPosts.filter(p => p.category === "Обход блокировок").length },
  ];

  const filteredPosts = blogPosts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         post.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         post.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCategory = selectedCategory === "all" || post.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const featuredPosts = blogPosts.filter(post => post.featured);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/10">
      {/* Header */}
      <div className="border-b bg-background/95 backdrop-blur">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Shield className="h-6 w-6 text-primary" />
              <span className="font-bold text-lg">SafeSurf VPN</span>
            </div>
            <Button variant="outline" asChild>
              <Link href="/">
                <ArrowLeft className="h-4 w-4 mr-2" />
                На главную
              </Link>
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16">
        <div className="max-w-6xl mx-auto">
          {/* Page Title */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-foreground mb-4">
              Блог SafeSurf VPN
            </h1>
            <p className="text-lg text-muted-foreground mb-8">
              Новости, советы и инструкции по VPN и безопасности в интернете
            </p>
            
            {/* Search */}
            <div className="relative max-w-md mx-auto">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Поиск статей..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="w-full">
            <TabsList className="w-full justify-start overflow-x-auto">
              {categories.map(category => (
                <TabsTrigger key={category.id} value={category.id} className="whitespace-nowrap">
                  {category.name} ({category.count})
                </TabsTrigger>
              ))}
            </TabsList>

            <TabsContent value={selectedCategory} className="space-y-8">
              {/* Featured Posts */}
              {selectedCategory === "all" && featuredPosts.length > 0 && (
                <div>
                  <h2 className="text-2xl font-bold text-foreground mb-6">Рекомендуемые статьи</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
                    {featuredPosts.map(post => (
                      <Card key={post.id} className="p-6 hover:shadow-lg transition-shadow">
                        <div className="flex items-center gap-2 mb-3">
                          <Badge variant="secondary">{post.category}</Badge>
                          <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400">
                            Рекомендуем
                          </Badge>
                        </div>
                        <Link href={`/blog/${post.id}`}>
                          <h3 className="text-xl font-semibold text-foreground hover:text-primary transition-colors mb-3">
                            {post.title}
                          </h3>
                        </Link>
                        <p className="text-muted-foreground mb-4 line-clamp-3">
                          {post.excerpt}
                        </p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <User className="h-4 w-4" />
                              {post.author}
                            </div>
                            <div className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              {formatDate(post.date)}
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              {post.readTime} мин
                            </div>
                          </div>
                          <Button variant="ghost" size="sm" asChild>
                            <Link href={`/blog/${post.id}`}>
                              Читать
                              <ArrowRight className="h-4 w-4 ml-1" />
                            </Link>
                          </Button>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* All Posts */}
              <div>
                <h2 className="text-2xl font-bold text-foreground mb-6">
                  {selectedCategory === "all" ? "Все статьи" : categories.find(c => c.id === selectedCategory)?.name}
                </h2>
                <div className="grid gap-6">
                  {filteredPosts.map(post => (
                    <Card key={post.id} className="p-6 hover:shadow-lg transition-shadow">
                      <div className="flex items-start justify-between gap-6">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-3">
                            <Badge variant="secondary">{post.category}</Badge>
                            {post.featured && (
                              <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400">
                                Рекомендуем
                              </Badge>
                            )}
                          </div>
                          <Link href={`/blog/${post.id}`}>
                            <h3 className="text-xl font-semibold text-foreground hover:text-primary transition-colors mb-3">
                              {post.title}
                            </h3>
                          </Link>
                          <p className="text-muted-foreground mb-4">
                            {post.excerpt}
                          </p>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                            <div className="flex items-center gap-1">
                              <User className="h-4 w-4" />
                              {post.author}
                            </div>
                            <div className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              {formatDate(post.date)}
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              {post.readTime} мин чтения
                            </div>
                          </div>
                          <div className="flex items-center gap-2 flex-wrap">
                            {post.tags.map(tag => (
                              <Badge key={tag} variant="outline" className="text-xs">
                                <Tag className="h-3 w-3 mr-1" />
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <Button variant="outline" asChild>
                          <Link href={`/blog/${post.id}`}>
                            Читать статью
                            <ArrowRight className="h-4 w-4 ml-2" />
                          </Link>
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>

              {filteredPosts.length === 0 && (
                <Card className="p-8 text-center">
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    Статьи не найдены
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    Попробуйте изменить поисковый запрос или выбрать другую категорию
                  </p>
                  <Button variant="outline" onClick={() => {
                    setSearchQuery("");
                    setSelectedCategory("all");
                  }}>
                    Показать все статьи
                  </Button>
                </Card>
              )}
            </TabsContent>
          </Tabs>

          {/* Newsletter Subscription */}
          <Card className="p-8 mt-12 bg-primary/5 border-primary/20">
            <div className="text-center">
              <h3 className="text-xl font-semibold text-foreground mb-2">
                Подписка на блог
              </h3>
              <p className="text-muted-foreground mb-6">
                Получайте новые статьи о VPN и безопасности на email
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
                <Input 
                  placeholder="Ваш email" 
                  type="email"
                  className="flex-1"
                />
                <Button>Подписаться</Button>
              </div>
              <p className="text-xs text-muted-foreground mt-4">
                Мы отправляем письма не чаще раза в неделю и не передаём данные третьим лицам
              </p>
            </div>
          </Card>

          {/* Popular Tags */}
          <Card className="p-6 mt-8">
            <h3 className="font-semibold text-foreground mb-4">Популярные теги</h3>
            <div className="flex flex-wrap gap-2">
              {Array.from(new Set(blogPosts.flatMap(post => post.tags))).map(tag => (
                <Badge 
                  key={tag} 
                  variant="outline" 
                  className="cursor-pointer hover:bg-primary/10"
                  onClick={() => setSearchQuery(tag)}
                >
                  <Tag className="h-3 w-3 mr-1" />
                  {tag}
                </Badge>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}