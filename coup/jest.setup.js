import '@testing-library/jest-dom';

// Mock next-auth
jest.mock('next-auth', () => ({
  getServerSession: jest.fn(),
}));

// Mock Prisma
jest.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    study: {
      findMany: jest.fn(),
    },
  },
}));

// Mock fs/promises
jest.mock('fs/promises', () => ({
  unlink: jest.fn(),
  writeFile: jest.fn(),
  mkdir: jest.fn(),
}));

// Mock path
jest.mock('path', () => ({
  join: jest.fn((...args) => args.join('/')),
  resolve: jest.fn((...args) => args.join('/')),
}));

// Mock Next.js Image component
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props) => {
    // eslint-disable-next-line jsx-a11y/alt-text, @next/next/no-img-element
    return <img {...props} />;
  },
}));

// Mock Next.js Router
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
  }),
  usePathname: () => '/test',
}));

// Mock next-auth/react for client components
jest.mock('next-auth/react', () => ({
  signOut: jest.fn(),
  useSession: jest.fn(() => ({
    data: null,
    status: 'unauthenticated',
  })),
}));

// Mock window objects (jsdom 환경에서만)
if (typeof window !== 'undefined') {
  // Mock window.confirm
  global.confirm = jest.fn(() => true);

  // Mock window.location.reload safely
  delete window.location;
  window.location = { reload: jest.fn(), href: '' };
}

// Mock console.error to avoid noisy test output
const originalError = console.error;
beforeAll(() => {
  console.error = jest.fn();
});

afterAll(() => {
  console.error = originalError;
});
