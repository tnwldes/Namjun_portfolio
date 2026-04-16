import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { db, auth } from './firebase';
import { 
  collection, 
  getDocs, 
  doc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  getDoc,
  query,
  orderBy
} from 'firebase/firestore';
import { onAuthStateChanged, signInWithPopup, GoogleAuthProvider, signOut, setPersistence, browserLocalPersistence } from 'firebase/auth';

export interface PortfolioItem {
  id: string;
  category: 'gov' | 'ppt' | 'op' | 'md';
  title: string;
  description: string;
  imageUrls: string[];
  tags: string[];
  toolsUsed?: string[];
  learnings?: string;
  link?: string;
  date: string;
}

export interface SiteContent {
  hero: {
    badge: string;
    title: string;
    subtitle: string;
  };
  about: {
    title: string;
    description: string;
    competencies: { title: string; desc: string }[];
    workingStyle: string[];
  };
  snsPromotion: {
    title: string;
    subtitle: string;
    instagramCase: string;
    blogStrategy: string;
    instagramImage?: string;
    blogImage?: string;
    rightImage?: string;
    items: { label: string; desc: string }[];
  };
  resume: {
    profileImage: string;
    name: string;
    email: string;
    phone: string;
    location: string;
    education: { school: string; major: string }[];
    skills: string[];
  };
  experience: {
    title: string;
    items: {
      company: string;
      role: string;
      period: string;
      description: string;
      details: string[];
    }[];
  };
  strengths: {
    title: string;
    subtitle: string;
    items: { title: string; desc: string }[];
  };
}

const initialSiteContent: SiteContent = {
  hero: {
    badge: '성과를 만드는 마케터 & 디자이너',
    title: '데이터와 디자인으로 \n성과를 증명합니다. \n김수지입니다.',
    subtitle: '단순한 디자인을 넘어 기획, 실행, 그리고 결과까지 책임집니다. \n정부사업 제안서부터 이커머스 실무까지, 실전형 성과를 제안합니다.',
  },
  about: {
    title: 'About Me',
    description: '“기획부터 실행, 성과까지 책임지는 \n 실무형 마케터입니다.”',
    competencies: [
      { title: '콘텐츠 기획', desc: '제안서 및 PPT 구조 설계 및 논리적 스토리텔링' },
      { title: '상세페이지 제작', desc: '구매 전환율 극대화를 위한 UX/UI 설계 및 디자인' },
      { title: '이커머스 운영', desc: 'MD 실무 기반의 상품 등록 및 채널 최적화 운영' },
      { title: '데이터 기반 개선', desc: '성과 지표 분석을 통한 지속적인 콘텐츠 최적화' },
    ],
    workingStyle: [
      '빠른 실행력과 유연한 대처',
      '철저한 마감 관리와 책임감',
      '커뮤니케이션 중심의 원활한 협업',
      '목표 달성을 위한 집요한 분석'
    ],
  },
  snsPromotion: {
    title: '트렌드를 읽고 \n브랜드를 알립니다.',
    subtitle: 'MZ세대의 감각으로 트렌드를 빠르게 캐치하고, 성실함으로 결과를 만들어냅니다. \n단순한 홍보를 넘어 브랜드의 가치를 전달하는 SNS 마케팅이 가능합니다.',
    instagramCase: '인스타그램 팔로워 200% 성장 및 도달률 개선 사례 보유',
    blogStrategy: '네이버 블로그 상위 노출 전략을 통한 유입량 150% 증대 성과',
    instagramImage: 'https://picsum.photos/seed/insta/800/600',
    blogImage: 'https://picsum.photos/seed/blog/800/600',
    rightImage: 'https://picsum.photos/seed/sns-right/800/800',
    items: [
      { label: 'SNS 기획', desc: '타겟 맞춤형 스토리텔링' },
      { label: '트렌드 분석', desc: '실시간 유행 키워드 활용' },
      { label: '콘텐츠 제작', desc: '눈길을 사로잡는 비주얼' },
      { label: '의지 & 성장', desc: '끊임없이 배우는 자세' }
    ]
  },
  resume: {
    profileImage: 'https://picsum.photos/seed/profile/400/400',
    name: '김수지',
    email: 'suji@example.com',
    phone: '010-1234-5678',
    location: 'Seoul, South Korea',
    education: [
      { school: 'OO대학교 디자인학부', major: '시각디자인 전공 졸업' }
    ],
    skills: ['Photoshop', 'Illustrator', 'PPT Expert', 'HTML/CSS', 'MD 실무', '데이터 분석']
  },
  experience: {
    title: 'Experience',
    items: [
      {
        company: '커넥트웨이브',
        role: '정부사업 제안 및 운영 / 이커머스 마케팅',
        period: '2022.05 - Present',
        description: '정부 지원 사업 제안서 기획 및 이커머스 콘텐츠 제작 총괄',
        details: [
          '정부사업 제안서 구조 설계 및 디자인 (수주율 30% 향상)',
          '이커머스 상세페이지 리뉴얼 및 구매 전환율 최적화',
          '신규 상품 소싱 및 온라인 판매 전략 수립',
          '광고 소재 제작 및 채널별 퍼포먼스 모니터링'
        ]
      },
      {
        company: '이전 회사명 (예시)',
        role: '콘텐츠 디자이너 / 마케터',
        period: '2020.03 - 2022.04',
        description: '브랜드 아이덴티티 구축 및 SNS 마케팅 콘텐츠 기획',
        details: [
          '브랜드 가이드라인 수립 및 시각화 작업',
          'SNS 채널 운영 및 카드뉴스/이벤트 배너 제작',
          '프로모션 페이지 기획 및 퍼블리싱 지원'
        ]
      }
    ]
  },
  strengths: {
    title: '일을 대하는 태도',
    subtitle: '단순히 주어진 일을 하는 것을 넘어, 비즈니스 성과를 위해 \n가장 성실하고 책임감 있게 움직입니다.',
    items: [
      { title: '마감 준수', desc: '철저한 일정 관리로 단 한 번의 마감 지연도 허용하지 않습니다.' },
      { title: '책임감', desc: '반복되는 작업이라도 최상의 퀄리티를 위해 끝까지 책임집니다.' },
      { title: '커뮤니케이션', desc: '문제 발생 시 즉각 공유하고 대안을 제시하는 협업 중심형 인재입니다.' },
    ]
  }
};

interface PortfolioStore {
  items: PortfolioItem[];
  siteContent: SiteContent;
  isInitialLoading: boolean;
  fetchData: () => Promise<void>;
  addItem: (item: PortfolioItem) => Promise<void>;
  updateItem: (id: string, item: Partial<PortfolioItem>) => Promise<void>;
  deleteItem: (id: string) => Promise<void>;
  updateSiteContent: (content: Partial<SiteContent>) => Promise<void>;
  resetSiteContent: () => Promise<void>;
  isAuthenticated: boolean;
  authError: string | null;
  login: (password: string) => Promise<void>;
  logout: () => Promise<void>;
  initAuth: () => void;
  setAuthError: (error: string | null) => void;
}

export const usePortfolioStore = create<PortfolioStore>()(
  persist(
    (set, get) => ({
      items: [],
      siteContent: initialSiteContent,
      isInitialLoading: true,
      isAuthenticated: false,
      authError: null,

      setAuthError: (error) => set({ authError: error }),

      initAuth: () => {
        // No-op for password auth, but kept for compatibility
      },

      fetchData: async () => {
        set({ isInitialLoading: true });
        try {
          // Fetch Portfolio Items
          const q = query(collection(db, 'portfolio'), orderBy('date', 'desc'));
          const querySnapshot = await getDocs(q);
          const items: PortfolioItem[] = [];
          querySnapshot.forEach((doc) => {
            items.push({ id: doc.id, ...doc.data() } as PortfolioItem);
          });

          // Fetch Site Content
          const contentDoc = await getDoc(doc(db, 'settings', 'content'));
          if (contentDoc.exists()) {
            set({ items, siteContent: contentDoc.data() as SiteContent, isInitialLoading: false });
          } else {
            // If no settings in DB, use initial and save it
            await setDoc(doc(db, 'settings', 'content'), initialSiteContent);
            set({ items, siteContent: initialSiteContent, isInitialLoading: false });
          }
        } catch (error) {
          console.error('Error fetching data:', error);
          set({ isInitialLoading: false });
        }
      },

      addItem: async (item) => {
        try {
          await setDoc(doc(db, 'portfolio', item.id), item);
          set((state) => ({ items: [item, ...state.items] }));
        } catch (error) {
          console.error('Error adding item:', error);
        }
      },

      updateItem: async (id, updatedFields) => {
        try {
          await updateDoc(doc(db, 'portfolio', id), updatedFields);
          set((state) => ({
            items: state.items.map((item) => (item.id === id ? { ...item, ...updatedFields } : item)),
          }));
        } catch (error) {
          console.error('Error updating item:', error);
        }
      },

      deleteItem: async (id) => {
        try {
          await deleteDoc(doc(db, 'portfolio', id));
          set((state) => ({ items: state.items.filter((item) => item.id !== id) }));
        } catch (error) {
          console.error('Error deleting item:', error);
        }
      },

      updateSiteContent: async (content) => {
        try {
          const newContent = { ...get().siteContent, ...content };
          await setDoc(doc(db, 'settings', 'content'), newContent);
          set({ siteContent: newContent });
        } catch (error) {
          console.error('Error updating site content:', error);
        }
      },

      resetSiteContent: async () => {
        try {
          await setDoc(doc(db, 'settings', 'content'), initialSiteContent);
          set({ siteContent: initialSiteContent });
        } catch (error) {
          console.error('Error resetting site content:', error);
        }
      },

      login: async (password: string) => {
        if (password === '1111') {
          set({ isAuthenticated: true, authError: null });
        } else {
          set({ authError: '비밀번호가 올바르지 않습니다.' });
        }
      },

      logout: async () => {
        set({ isAuthenticated: false });
      },
    }),
    {
      name: 'portfolio-storage',
      partialize: (state) => ({ siteContent: state.siteContent, items: state.items }),
    }
  )
);
