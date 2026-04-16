import React, { useState, useEffect } from 'react';
import { usePortfolioStore, PortfolioItem, SiteContent } from '../store';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Plus, Trash2, Edit, LogOut, Save, Eye, User, Layout as LayoutIcon, Info, Zap, Briefcase, CheckCircle2 } from 'lucide-react';
import { storage } from '../firebase';
import { ref, uploadString, getDownloadURL } from 'firebase/storage';

export default function AdminPanel() {
  const { items, siteContent, addItem, updateItem, deleteItem, updateSiteContent, resetSiteContent, logout, fetchData, isInitialLoading } = usePortfolioStore();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<PortfolioItem | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'gov' as PortfolioItem['category'],
    imageUrls: [] as string[],
    tags: '',
    toolsUsed: '',
    learnings: '',
  });

  const [siteFormData, setSiteFormData] = useState<SiteContent>(siteContent);
  const [isProcessing, setIsProcessing] = useState(false);
  const [tempImageUrl, setTempImageUrl] = useState('');

  useEffect(() => {
    setSiteFormData(siteContent);
  }, [siteContent]);

  const compressImage = (base64Str: string, maxWidth = 1000, maxHeight = 1000, quality = 0.6): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.src = base64Str;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxWidth) {
            height *= maxWidth / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width *= maxHeight / height;
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        // Use jpeg for better compression
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
    });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      setIsProcessing(true);
      const fileArray = Array.from(files);
      
      try {
        const urls = await Promise.all(fileArray.map(async (file: File) => {
          // Use a smaller preview/compression only if file is very large
          let imageToUpload: string | ArrayBuffer | null = null;
          
          const readerPromise = new Promise<string | ArrayBuffer | null>((resolve) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.readAsDataURL(file);
          });

          const base64 = await readerPromise;
          
          // If file > 1MB, compress it. Otherwise upload original.
          let finalData = base64 as string;
          if (file.size > 1024 * 1024) {
            finalData = await compressImage(finalData, 1600, 1600, 0.8);
          }

          const storageRef = ref(storage, `portfolio/${Date.now()}_${file.name}`);
          await uploadString(storageRef, finalData, 'data_url');
          return await getDownloadURL(storageRef);
        }));

        setFormData(prev => ({
          ...prev,
          imageUrls: [...prev.imageUrls, ...urls]
        }));
      } catch (error) {
        console.error('Upload error:', error);
        alert('이미지 업로드 중 오류가 발생했습니다.');
      } finally {
        setIsProcessing(false);
      }
    }
  };

  const handleProfileImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsProcessing(true);
      try {
        const readerPromise = new Promise<string | ArrayBuffer | null>((resolve) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result);
          reader.readAsDataURL(file);
        });

        const base64 = await readerPromise;
        let finalData = base64 as string;
        
        // Profile images are usually small, but let's compress if > 500KB
        if (file.size > 500 * 1024) {
          finalData = await compressImage(finalData, 800, 800, 0.8);
        }

        const storageRef = ref(storage, `profile/${Date.now()}_profile.jpg`);
        await uploadString(storageRef, finalData, 'data_url');
        const url = await getDownloadURL(storageRef);
        
        setSiteFormData(prev => ({
          ...prev,
          resume: { ...prev.resume, profileImage: url }
        }));
        
        // Auto-save profile image to avoid confusion
        const updatedContent = { ...siteFormData, resume: { ...siteFormData.resume, profileImage: url } };
        await updateSiteContent(updatedContent);
        alert('프로필 이미지가 변경 및 저장되었습니다.');
      } catch (error) {
        console.error('Profile upload error:', error);
        alert('프로필 이미지 업로드 중 오류가 발생했습니다.');
      } finally {
        setIsProcessing(false);
      }
    }
  };

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      imageUrls: prev.imageUrls.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    let finalImageUrls = [...formData.imageUrls];
    if (tempImageUrl.trim()) {
      finalImageUrls.push(tempImageUrl.trim());
    }

    const newItem: PortfolioItem = {
      id: editingItem ? editingItem.id : Math.random().toString(36).substr(2, 9),
      title: formData.title,
      description: formData.description,
      category: formData.category,
      imageUrls: finalImageUrls.length > 0 ? finalImageUrls : [`https://picsum.photos/seed/${Math.random()}/800/600`],
      tags: formData.tags.split(',').map((t) => t.trim()),
      toolsUsed: formData.toolsUsed.split(',').map((t) => t.trim()),
      learnings: formData.learnings,
      date: new Date().toISOString().split('T')[0],
    };

    if (editingItem) {
      await updateItem(editingItem.id, newItem);
      alert('작업물이 수정되었습니다.');
    } else {
      await addItem(newItem);
      alert('새 작업물이 추가되었습니다.');
    }

    setFormData({ title: '', description: '', category: 'gov', imageUrls: [], tags: '', toolsUsed: '', learnings: '' });
    setTempImageUrl('');
    setEditingItem(null);
    setIsAddOpen(false);
  };

  const handleSiteContentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      updateSiteContent(siteFormData);
      alert('사이트 정보가 저장되었습니다!');
    } catch (error) {
      console.error('Save error:', error);
      alert('저장 중 오류가 발생했습니다. 이미지 용량이 너무 클 수 있습니다.');
    }
  };

  const startEdit = (item: PortfolioItem) => {
    setEditingItem(item);
    setFormData({
      title: item.title,
      description: item.description,
      category: item.category,
      imageUrls: item.imageUrls,
      tags: item.tags.join(', '),
      toolsUsed: item.toolsUsed?.join(', ') || '',
      learnings: item.learnings || '',
    });
    setIsAddOpen(true);
  };

  const handlePreview = () => {
    window.open('/', '_blank');
  };

  return (
    <div className="container mx-auto py-12 px-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-toss-gray-900">관리자 패널</h1>
          <p className="text-toss-gray-500 font-medium mt-1">포트폴리오와 사이트 콘텐츠를 자유롭게 관리하세요.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button onClick={handlePreview} variant="outline" className="gap-2 rounded-xl h-12 px-6 font-bold border-toss-gray-200">
            <Eye className="w-4 h-4" /> 사이트 미리보기
          </Button>
          <Button onClick={() => logout()} variant="ghost" className="gap-2 rounded-xl h-12 px-6 font-bold text-toss-gray-400 hover:text-red-500">
            <LogOut className="w-4 h-4" /> 로그아웃
          </Button>
        </div>
      </div>

      <Tabs defaultValue="portfolio" className="w-full">
        <TabsList className="bg-toss-gray-100 p-1.5 rounded-2xl mb-12 h-auto">
          <TabsTrigger value="portfolio" className="px-8 py-3 rounded-xl font-bold data-[state=active]:bg-white data-[state=active]:text-toss-blue data-[state=active]:shadow-sm">
            <LayoutIcon className="w-4 h-4 mr-2" /> 포트폴리오 관리
          </TabsTrigger>
          <TabsTrigger value="site" className="px-8 py-3 rounded-xl font-bold data-[state=active]:bg-white data-[state=active]:text-toss-blue data-[state=active]:shadow-sm">
            <Info className="w-4 h-4 mr-2" /> 사이트 정보 수정
          </TabsTrigger>
        </TabsList>

        <TabsContent value="portfolio" className="space-y-8">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-toss-gray-900">작업물 목록</h2>
            <Dialog open={isAddOpen} onOpenChange={(open) => {
              setIsAddOpen(open);
              if (!open) {
                setEditingItem(null);
                setFormData({ title: '', description: '', category: 'ppt', imageUrls: [], tags: '', toolsUsed: '', learnings: '' });
              }
            }}>
              <DialogTrigger asChild>
                <Button className="gap-2 bg-toss-blue hover:bg-toss-blue/90 rounded-xl h-12 px-6 font-bold shadow-lg shadow-toss-blue/20">
                  <Plus className="w-4 h-4" /> 새 작업물 추가
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto rounded-[32px]">
                <DialogHeader>
                  <DialogTitle className="text-2xl font-bold">{editingItem ? '작업물 수정' : '새 작업물 추가'}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-6 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="title" className="font-bold">제목</Label>
                    <Input
                      id="title"
                      className="rounded-xl h-12"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="category" className="font-bold">카테고리</Label>
                    <select
                      id="category"
                      className="w-full h-12 px-4 border border-toss-gray-200 rounded-xl font-medium focus:ring-2 focus:ring-toss-blue/20 outline-none"
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                    >
                      <option value="gov">정부지원사업 / 사업기획</option>
                      <option value="ppt">PPT / 발표자료</option>
                      <option value="op">운영 / PM</option>
                      <option value="md">MD / 이커머스 운영</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description" className="font-bold">설명</Label>
                    <Textarea
                      id="description"
                      className="rounded-xl min-h-[100px]"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="font-bold">이미지 (직접 링크 URL 입력 또는 업로드)</Label>
                    <p className="text-[10px] text-toss-gray-400 mb-1">* .jpg, .png 등으로 끝나는 직접 이미지 링크를 권장합니다.</p>
                    <div className="flex gap-2">
                      <Input 
                        placeholder="https://example.com/image.jpg" 
                        value={tempImageUrl}
                        onChange={(e) => setTempImageUrl(e.target.value)}
                        className="rounded-xl h-12 flex-1"
                      />
                      <Button 
                        type="button"
                        onClick={() => {
                          if (tempImageUrl.trim()) {
                            setFormData(prev => ({
                              ...prev,
                              imageUrls: [...prev.imageUrls, tempImageUrl.trim()]
                            }));
                            setTempImageUrl('');
                          }
                        }}
                        className="bg-toss-blue text-white rounded-xl h-12 px-6"
                      >
                        추가
                      </Button>
                    </div>
                    {isProcessing && (
                      <div className="flex items-center gap-2 py-1">
                        <div className="w-3 h-3 border-2 border-toss-blue border-t-transparent rounded-full animate-spin"></div>
                        <p className="text-xs text-toss-blue font-bold">이미지를 서버에 저장하는 중입니다...</p>
                      </div>
                    )}
                    <div className="grid grid-cols-3 gap-3 mb-2">
                      {formData.imageUrls.map((url, i) => (
                        <div key={i} className="relative aspect-video rounded-2xl overflow-hidden border border-toss-gray-100 group">
                          <img src={url} alt="preview" referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                          <button 
                            type="button"
                            onClick={() => removeImage(i)}
                            className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-full hover:bg-red-600 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                      <label className="aspect-video rounded-2xl border-2 border-dashed border-toss-gray-200 flex flex-col items-center justify-center cursor-pointer hover:bg-toss-gray-50 transition-all hover:border-toss-blue group">
                        <Plus className="w-6 h-6 text-toss-gray-300 group-hover:text-toss-blue transition-colors" />
                        <span className="text-xs font-bold text-toss-gray-400 mt-2 group-hover:text-toss-blue">추가</span>
                        <input 
                          type="file" 
                          multiple 
                          accept="image/*" 
                          className="hidden" 
                          onChange={handleFileChange} 
                        />
                      </label>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="tags" className="font-bold">태그 (쉼표 구분)</Label>
                      <Input
                        id="tags"
                        className="rounded-xl h-12"
                        placeholder="기획, 디자인"
                        value={formData.tags}
                        onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="toolsUsed" className="font-bold">사용 툴 (쉼표 구분)</Label>
                      <Input
                        id="toolsUsed"
                        className="rounded-xl h-12"
                        placeholder="Figma, Photoshop"
                        value={formData.toolsUsed}
                        onChange={(e) => setFormData({ ...formData, toolsUsed: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="learnings" className="font-bold">배운 점 및 성과</Label>
                    <Textarea
                      id="learnings"
                      className="rounded-xl min-h-[100px]"
                      placeholder="이 프로젝트를 통해 얻은 성과를 적어주세요."
                      value={formData.learnings}
                      onChange={(e) => setFormData({ ...formData, learnings: e.target.value })}
                    />
                  </div>
                  <Button 
                    type="submit" 
                    disabled={isProcessing}
                    className="w-full bg-toss-blue hover:bg-toss-blue/90 rounded-xl h-14 font-black text-lg shadow-xl shadow-toss-blue/20 disabled:opacity-50"
                  >
                    {isProcessing ? '이미지 처리 중...' : (editingItem ? '수정 완료' : '작업물 추가하기')}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {items.map((item) => (
              <Card key={item.id} className="overflow-hidden group border-none shadow-sm hover:shadow-xl transition-all duration-500 rounded-[32px] bg-white">
                <div className="aspect-video relative overflow-hidden bg-toss-gray-100">
                  <img
                    src={item.imageUrls[0]}
                    alt={item.title}
                    className="object-cover w-full h-full transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-toss-gray-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 backdrop-blur-[2px]">
                    <Button variant="secondary" size="sm" onClick={() => startEdit(item)} className="rounded-xl font-bold">
                      <Edit className="w-4 h-4 mr-2" /> 수정
                    </Button>
                    <Button variant="destructive" size="sm" onClick={() => deleteItem(item.id)} className="rounded-xl font-bold">
                      <Trash2 className="w-4 h-4 mr-2" /> 삭제
                    </Button>
                  </div>
                </div>
                <CardHeader className="p-6">
                  <CardTitle className="text-xl font-bold text-toss-gray-900">{item.title}</CardTitle>
                  <p className="text-sm text-toss-gray-500 font-medium line-clamp-1 mt-1">{item.description}</p>
                </CardHeader>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="site">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold text-toss-gray-900">사이트 정보 수정</h2>
            <Button 
              type="button"
              variant="outline" 
              onClick={() => {
                if (confirm('모든 사이트 텍스트 정보를 초기 상태로 되돌리시겠습니까?')) {
                  resetSiteContent();
                  setSiteFormData(siteContent);
                }
              }}
              className="text-toss-gray-500 hover:text-red-500 rounded-xl"
            >
              기본값으로 초기화
            </Button>
          </div>
          <form onSubmit={handleSiteContentSubmit} className="max-w-4xl space-y-12">
            <div className="bg-white p-10 rounded-[40px] shadow-sm border border-toss-gray-100 space-y-8">
              <h3 className="text-2xl font-bold text-toss-gray-900 flex items-center gap-3">
                <LayoutIcon className="w-6 h-6 text-toss-blue" /> 메인 히어로 섹션
              </h3>
              <div className="grid grid-cols-1 gap-6">
                <div className="space-y-2">
                  <Label className="font-bold">배지 텍스트</Label>
                  <Input 
                    value={siteFormData.hero?.badge || ''}
                    onChange={(e) => setSiteFormData({ ...siteFormData, hero: { ...(siteFormData.hero || {}), badge: e.target.value } })}
                    className="rounded-xl h-12"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="font-bold">메인 타이틀 (줄바꿈은 \n 사용)</Label>
                  <Textarea 
                    value={siteFormData.hero?.title || ''}
                    onChange={(e) => setSiteFormData({ ...siteFormData, hero: { ...(siteFormData.hero || {}), title: e.target.value } })}
                    className="rounded-xl min-h-[100px]"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="font-bold">서브 타이틀 (줄바꿈은 \n 사용)</Label>
                  <Textarea 
                    value={siteFormData.hero?.subtitle || ''}
                    onChange={(e) => setSiteFormData({ ...siteFormData, hero: { ...(siteFormData.hero || {}), subtitle: e.target.value } })}
                    className="rounded-xl min-h-[100px]"
                  />
                </div>
              </div>
            </div>

            <div className="bg-white p-10 rounded-[40px] shadow-sm border border-toss-gray-100 space-y-8">
              <h3 className="text-2xl font-bold text-toss-gray-900 flex items-center gap-3">
                <Briefcase className="w-6 h-6 text-toss-blue" /> 경력 사항 (Experience)
              </h3>
              <div className="space-y-8">
                <div className="space-y-2">
                  <Label className="font-bold">경력 섹션 타이틀</Label>
                  <Input 
                    value={siteFormData.experience?.title || ''}
                    onChange={(e) => setSiteFormData({ ...siteFormData, experience: { ...(siteFormData.experience || {}), title: e.target.value } })}
                    className="rounded-xl h-12"
                  />
                </div>
                
                {siteFormData.experience?.items?.map((exp, i) => (
                  <div key={i} className="p-6 border border-toss-gray-200 rounded-[32px] space-y-4 relative">
                    <Button 
                      type="button" 
                      variant="ghost" 
                      onClick={() => {
                        const newItems = (siteFormData.experience?.items || []).filter((_, idx) => idx !== i);
                        setSiteFormData({ ...siteFormData, experience: { ...siteFormData.experience, items: newItems } });
                      }}
                      className="absolute top-4 right-4 text-red-500"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-xs font-bold">회사명</Label>
                        <Input 
                          value={exp.company}
                          onChange={(e) => {
                            const newItems = [...(siteFormData.experience?.items || [])];
                            newItems[i].company = e.target.value;
                            setSiteFormData({ ...siteFormData, experience: { ...siteFormData.experience, items: newItems } });
                          }}
                          className="rounded-xl h-10"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs font-bold">기간</Label>
                        <Input 
                          value={exp.period}
                          onChange={(e) => {
                            const newItems = [...(siteFormData.experience?.items || [])];
                            newItems[i].period = e.target.value;
                            setSiteFormData({ ...siteFormData, experience: { ...siteFormData.experience, items: newItems } });
                          }}
                          className="rounded-xl h-10"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-bold">역할</Label>
                      <Input 
                        value={exp.role}
                        onChange={(e) => {
                          const newItems = [...(siteFormData.experience?.items || [])];
                          newItems[i].role = e.target.value;
                          setSiteFormData({ ...siteFormData, experience: { ...siteFormData.experience, items: newItems } });
                        }}
                        className="rounded-xl h-10"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-bold">한줄 설명</Label>
                      <Input 
                        value={exp.description}
                        onChange={(e) => {
                          const newItems = [...(siteFormData.experience?.items || [])];
                          newItems[i].description = e.target.value;
                          setSiteFormData({ ...siteFormData, experience: { ...siteFormData.experience, items: newItems } });
                        }}
                        className="rounded-xl h-10"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-bold">상세 성과 (쉼표로 구분)</Label>
                      <Textarea 
                        value={exp.details?.join(', ') || ''}
                        onChange={(e) => {
                          const newItems = [...(siteFormData.experience?.items || [])];
                          newItems[i].details = e.target.value.split(',').map(s => s.trim());
                          setSiteFormData({ ...siteFormData, experience: { ...siteFormData.experience, items: newItems } });
                        }}
                        className="rounded-xl min-h-[80px]"
                      />
                    </div>
                  </div>
                )) || <p className="text-toss-gray-400">정보가 없습니다.</p>}
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => {
                    const newItem = { company: '', role: '', period: '', description: '', details: [] };
                    setSiteFormData({ ...siteFormData, experience: { ...siteFormData.experience, items: [...(siteFormData.experience?.items || []), newItem] } });
                  }}
                  className="w-full rounded-xl border-dashed h-12"
                >
                  <Plus className="w-4 h-4 mr-2" /> 경력 추가
                </Button>
              </div>
            </div>

            <div className="bg-white p-10 rounded-[40px] shadow-sm border border-toss-gray-100 space-y-8">
              <h3 className="text-2xl font-bold text-toss-gray-900 flex items-center gap-3">
                <User className="w-6 h-6 text-toss-blue" /> 프로필 및 이력서 정보
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <Label className="font-bold">프로필 이미지 (직접 링크 URL 또는 업로드)</Label>
                  <p className="text-[10px] text-toss-gray-400 mb-1">* 외부 호스팅 이미지 사용 시 직접 링크를 입력하고 [적용]을 누르세요.</p>
                  <div className="flex gap-2 mb-4">
                    <Input 
                      placeholder="https://example.com/profile.jpg" 
                      value={siteFormData.resume?.profileImage || ''}
                      onChange={(e) => setSiteFormData({ ...siteFormData, resume: { ...(siteFormData.resume || {}), profileImage: e.target.value } })}
                      className="rounded-xl h-12 flex-1"
                    />
                    <Button 
                      type="button"
                      onClick={async () => {
                        try {
                          await updateSiteContent(siteFormData);
                          alert('프로필 이미지 URL이 저장되었습니다.');
                        } catch (error) {
                          alert('저장 중 오류가 발생했습니다.');
                        }
                      }}
                      className="bg-toss-blue text-white rounded-xl h-12 px-4"
                    >
                      적용
                    </Button>
                  </div>
                  {isProcessing && (
                    <div className="flex items-center gap-2 py-1">
                      <div className="w-3 h-3 border-2 border-toss-blue border-t-transparent rounded-full animate-spin"></div>
                      <p className="text-xs text-toss-blue font-bold">프로필 이미지를 저장하는 중입니다...</p>
                    </div>
                  )}
                  <div className="relative w-40 aspect-[3/4] rounded-3xl overflow-hidden border border-toss-gray-100 group">
                    <img src={siteFormData.resume?.profileImage || ''} alt="profile" referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                    <label className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                      <Edit className="w-6 h-6 text-white" />
                      <input type="file" accept="image/*" className="hidden" onChange={handleProfileImageChange} />
                    </label>
                  </div>
                </div>
                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label className="font-bold">이름</Label>
                    <Input 
                      value={siteFormData.resume?.name || ''}
                      onChange={(e) => setSiteFormData({ ...siteFormData, resume: { ...(siteFormData.resume || {}), name: e.target.value } })}
                      className="rounded-xl h-12"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="font-bold">연락처</Label>
                    <Input 
                      value={siteFormData.resume?.phone || ''}
                      onChange={(e) => setSiteFormData({ ...siteFormData, resume: { ...(siteFormData.resume || {}), phone: e.target.value } })}
                      className="rounded-xl h-12"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="font-bold">위치</Label>
                    <Input 
                      value={siteFormData.resume?.location || ''}
                      onChange={(e) => setSiteFormData({ ...siteFormData, resume: { ...(siteFormData.resume || {}), location: e.target.value } })}
                      className="rounded-xl h-12"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-4 sticky bottom-8 z-20">
              <Button 
                type="submit" 
                disabled={isProcessing}
                className="bg-toss-blue hover:bg-toss-blue/90 rounded-2xl h-16 px-12 font-black text-xl shadow-2xl shadow-toss-blue/30 gap-3 disabled:opacity-50"
              >
                {isProcessing ? (
                  <span className="animate-pulse">처리 중...</span>
                ) : (
                  <>
                    <Save className="w-6 h-6" /> 설정 저장하기
                  </>
                )}
              </Button>
            </div>
          </form>
        </TabsContent>
      </Tabs>
    </div>
  );
}
