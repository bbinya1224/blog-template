import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { Modal } from './Modal';
import { Button } from '../Button';

// Wrapper component props type
type ModalWrapperProps = Omit<
  React.ComponentProps<typeof Modal>,
  'isOpen' | 'onClose'
>;

const meta = {
  title: 'Shared/Modal',
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg', 'xl', 'full'],
    },
    showCloseButton: {
      control: 'boolean',
    },
    closeOnOverlayClick: {
      control: 'boolean',
    },
  },
} satisfies Meta<ModalWrapperProps>;

export default meta;
type Story = StoryObj<ModalWrapperProps>;

// 기본 모달을 테스트하기 위한 Wrapper 컴포넌트
function ModalWrapper(args: ModalWrapperProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div>
      <Button onClick={() => setIsOpen(true)}>모달 열기</Button>
      <Modal {...args} isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </div>
  );
}

export const Default: Story = {
  render: (args) => <ModalWrapper {...args} />,
  args: {
    title: '기본 모달',
    children: <p>모달 콘텐츠입니다.</p>,
  },
};

export const Small: Story = {
  render: (args) => <ModalWrapper {...args} />,
  args: {
    title: '작은 모달',
    size: 'sm',
    children: (
      <div>
        <p>작은 크기의 모달입니다.</p>
        <p className='mt-2 text-sm text-gray-600'>
          간단한 확인 메시지나 짧은 폼에 적합합니다.
        </p>
      </div>
    ),
  },
};

export const Large: Story = {
  render: (args) => <ModalWrapper {...args} />,
  args: {
    title: '큰 모달',
    size: 'lg',
    children: (
      <div className='space-y-4'>
        <p>큰 크기의 모달입니다.</p>
        <p className='text-sm text-gray-600'>
          많은 콘텐츠나 복잡한 폼에 적합합니다.
        </p>
        <div className='rounded-lg bg-gray-100 p-4'>
          <h3 className='font-semibold'>예시 섹션</h3>
          <p className='mt-2'>더 많은 콘텐츠를 표시할 수 있습니다.</p>
        </div>
      </div>
    ),
  },
};

export const ExtraLarge: Story = {
  render: (args) => <ModalWrapper {...args} />,
  args: {
    title: '매우 큰 모달',
    size: 'xl',
    children: (
      <div className='space-y-4'>
        <p>매우 큰 크기의 모달입니다.</p>
        <div className='grid grid-cols-2 gap-4'>
          <div className='rounded-lg bg-gray-100 p-4'>
            <h3 className='font-semibold'>섹션 1</h3>
            <p className='mt-2'>왼쪽 콘텐츠</p>
          </div>
          <div className='rounded-lg bg-gray-100 p-4'>
            <h3 className='font-semibold'>섹션 2</h3>
            <p className='mt-2'>오른쪽 콘텐츠</p>
          </div>
        </div>
      </div>
    ),
  },
};

export const WithoutTitle: Story = {
  render: (args) => <ModalWrapper {...args} />,
  args: {
    children: (
      <div className='text-center'>
        <h3 className='text-lg font-semibold'>커스텀 헤더</h3>
        <p className='mt-2'>title prop 없이 커스텀 콘텐츠를 사용할 수 있습니다.</p>
      </div>
    ),
  },
};

export const WithoutCloseButton: Story = {
  render: (args) => <ModalWrapper {...args} />,
  args: {
    title: '닫기 버튼 없음',
    showCloseButton: false,
    children: (
      <div>
        <p>X 버튼이 표시되지 않습니다.</p>
        <p className='mt-2 text-sm text-gray-600'>
          ESC 키나 외부 클릭으로만 닫을 수 있습니다.
        </p>
      </div>
    ),
  },
};

export const NoOverlayClose: Story = {
  render: (args) => <ModalWrapper {...args} />,
  args: {
    title: '외부 클릭으로 닫기 비활성화',
    closeOnOverlayClick: false,
    children: (
      <div>
        <p>배경을 클릭해도 모달이 닫히지 않습니다.</p>
        <p className='mt-2 text-sm text-gray-600'>
          X 버튼이나 ESC 키로만 닫을 수 있습니다.
        </p>
      </div>
    ),
  },
};

export const WithForm: Story = {
  render: (args) => <ModalWrapper {...args} />,
  args: {
    title: '폼 예시',
    size: 'md',
    children: (
      <form className='space-y-4'>
        <div>
          <label htmlFor='name' className='block text-sm font-medium text-gray-700'>
            이름
          </label>
          <input
            type='text'
            id='name'
            className='mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none'
            placeholder='이름을 입력하세요'
          />
        </div>
        <div>
          <label htmlFor='email' className='block text-sm font-medium text-gray-700'>
            이메일
          </label>
          <input
            type='email'
            id='email'
            className='mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none'
            placeholder='email@example.com'
          />
        </div>
        <div className='flex justify-end gap-2'>
          <Button variant='secondary'>취소</Button>
          <Button variant='primary'>제출</Button>
        </div>
      </form>
    ),
  },
};

export const ConfirmDialog: Story = {
  render: (args) => <ModalWrapper {...args} />,
  args: {
    title: '삭제 확인',
    size: 'sm',
    children: (
      <div>
        <p className='text-gray-700'>정말로 이 항목을 삭제하시겠습니까?</p>
        <p className='mt-2 text-sm text-gray-500'>이 작업은 되돌릴 수 없습니다.</p>
        <div className='mt-6 flex justify-end gap-2'>
          <Button variant='secondary' size='sm'>
            취소
          </Button>
          <Button variant='danger' size='sm'>
            삭제
          </Button>
        </div>
      </div>
    ),
  },
};

export const AllSizes: Story = {
  render: () => {
    const [openModal, setOpenModal] = useState<string | null>(null);

    return (
      <div className='flex flex-col gap-4'>
        <Button onClick={() => setOpenModal('sm')}>Small 모달</Button>
        <Button onClick={() => setOpenModal('md')}>Medium 모달</Button>
        <Button onClick={() => setOpenModal('lg')}>Large 모달</Button>
        <Button onClick={() => setOpenModal('xl')}>XL 모달</Button>
        <Button onClick={() => setOpenModal('full')}>Full 모달</Button>

        <Modal
          isOpen={openModal === 'sm'}
          onClose={() => setOpenModal(null)}
          title='Small 모달'
          size='sm'
        >
          <p>작은 크기 (max-w-md)</p>
        </Modal>

        <Modal
          isOpen={openModal === 'md'}
          onClose={() => setOpenModal(null)}
          title='Medium 모달'
          size='md'
        >
          <p>중간 크기 (max-w-2xl)</p>
        </Modal>

        <Modal
          isOpen={openModal === 'lg'}
          onClose={() => setOpenModal(null)}
          title='Large 모달'
          size='lg'
        >
          <p>큰 크기 (max-w-4xl)</p>
        </Modal>

        <Modal
          isOpen={openModal === 'xl'}
          onClose={() => setOpenModal(null)}
          title='XL 모달'
          size='xl'
        >
          <p>매우 큰 크기 (max-w-6xl)</p>
        </Modal>

        <Modal
          isOpen={openModal === 'full'}
          onClose={() => setOpenModal(null)}
          title='Full 모달'
          size='full'
        >
          <p>전체 너비 (max-w-full mx-4)</p>
        </Modal>
      </div>
    );
  },
};
