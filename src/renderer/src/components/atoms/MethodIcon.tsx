import React from 'react';
import { FiDownload, FiUpload, FiEdit2, FiEdit3, FiTrash2, FiEye, FiList } from 'react-icons/fi';
import { useTranslation } from 'react-i18next';

export interface MethodIconProps {
  method: string;
  size?: number;
}

const ICON_MAP: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  GET: FiDownload,
  POST: FiUpload,
  PUT: FiEdit3,
  PATCH: FiEdit2,
  DELETE: FiTrash2,
  HEAD: FiEye,
  OPTIONS: FiList,
};

const COLOR_MAP: Record<string, string> = {
  GET: 'text-blue-500',
  POST: 'text-green-500',
  PUT: 'text-yellow-500',
  PATCH: 'text-purple-500',
  DELETE: 'text-red-500',
  HEAD: 'text-gray-500',
  OPTIONS: 'text-gray-500',
};

export const MethodIcon: React.FC<MethodIconProps> = ({ method, size = 18 }) => {
  const { t } = useTranslation();
  const upper = method.toUpperCase();
  const Icon = ICON_MAP[upper] || FiList;
  const color = COLOR_MAP[upper] || 'text-gray-500';
  return <Icon size={size} className={color} aria-label={t(`method_${upper.toLowerCase()}`)} />;
};

export default MethodIcon;
