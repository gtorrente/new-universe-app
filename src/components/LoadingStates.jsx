import { FaSpinner } from 'react-icons/fa';

// Loading básico com spinner
export const LoadingSpinner = ({ size = 'medium', color = 'purple' }) => {
  const sizeClasses = {
    small: 'h-4 w-4',
    medium: 'h-8 w-8', 
    large: 'h-12 w-12',
    xlarge: 'h-16 w-16'
  };

  const colorClasses = {
    purple: 'text-purple-500',
    blue: 'text-blue-500',
    green: 'text-green-500',
    gray: 'text-gray-500',
    white: 'text-white'
  };

  return (
    <FaSpinner 
      className={`animate-spin ${sizeClasses[size]} ${colorClasses[color]}`}
    />
  );
};

// Loading para páginas inteiras
export const PageLoading = ({ message = 'Carregando...' }) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-blue-50">
      <div className="text-center">
        <LoadingSpinner size="xlarge" color="purple" />
        <p className="mt-4 text-lg text-gray-600 font-medium">{message}</p>
        <div className="mt-2 flex justify-center space-x-1">
          <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"></div>
          <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
          <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
        </div>
      </div>
    </div>
  );
};

// Loading para cards/componentes
export const CardLoading = ({ message = 'Carregando...' }) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 bg-white rounded-lg shadow-sm border">
      <LoadingSpinner size="large" color="purple" />
      <p className="mt-3 text-gray-600 font-medium">{message}</p>
    </div>
  );
};

// Loading para botões
export const ButtonLoading = ({ message = 'Aguarde...' }) => {
  return (
    <div className="flex items-center gap-2">
      <LoadingSpinner size="small" color="white" />
      <span>{message}</span>
    </div>
  );
};

// Loading skeleton para listas
export const SkeletonLoader = ({ lines = 3, avatar = false, height = 'h-4' }) => {
  return (
    <div className="animate-pulse">
      <div className="flex items-center space-x-3">
        {avatar && (
          <div className="rounded-full bg-gray-300 h-10 w-10"></div>
        )}
        <div className="flex-1 space-y-2">
          {Array.from({ length: lines }).map((_, index) => (
            <div 
              key={index}
              className={`bg-gray-300 rounded ${height}`}
              style={{ 
                width: index === lines - 1 ? '75%' : '100%' 
              }}
            ></div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Loading para tarot cards
export const TarotCardLoading = () => {
  return (
    <div className="relative">
      <div className="w-24 h-36 bg-gradient-to-br from-purple-200 to-purple-300 rounded-lg shadow-lg animate-pulse">
        <div className="absolute inset-0 flex items-center justify-center">
          <LoadingSpinner size="medium" color="purple" />
        </div>
      </div>
    </div>
  );
};

// Loading para texto sendo digitado (efeito typewriter)
export const TypingLoading = ({ message = 'IA está pensando' }) => {
  return (
    <div className="flex items-center gap-2 text-gray-600">
      <LoadingSpinner size="small" color="purple" />
      <span className="font-medium">{message}</span>
      <div className="flex space-x-1">
        <div className="w-1 h-1 bg-purple-400 rounded-full animate-pulse"></div>
        <div className="w-1 h-1 bg-purple-400 rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
        <div className="w-1 h-1 bg-purple-400 rounded-full animate-pulse" style={{animationDelay: '0.4s'}}></div>
      </div>
    </div>
  );
};

// Loading para upload de arquivos
export const UploadLoading = ({ progress = 0, fileName = 'arquivo' }) => {
  return (
    <div className="bg-white rounded-lg p-4 border border-gray-200">
      <div className="flex items-center gap-3 mb-2">
        <LoadingSpinner size="small" color="blue" />
        <span className="text-sm font-medium text-gray-700">
          Enviando {fileName}...
        </span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div 
          className="bg-blue-500 h-2 rounded-full transition-all duration-300"
          style={{ width: `${progress}%` }}
        ></div>
      </div>
      <div className="text-xs text-gray-500 mt-1">{progress}% concluído</div>
    </div>
  );
};

// Loading para áudio
export const AudioLoading = ({ message = 'Gerando áudio mágico...' }) => {
  return (
    <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-purple-100 to-pink-100 rounded-lg">
      <div className="flex space-x-1">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="w-1 bg-purple-500 rounded-full animate-pulse"
            style={{
              height: `${Math.random() * 20 + 10}px`,
              animationDelay: `${i * 0.1}s`,
              animationDuration: '0.6s'
            }}
          ></div>
        ))}
      </div>
      <span className="text-purple-700 font-medium">{message}</span>
    </div>
  );
};

// Loading state wrapper genérico
export const LoadingWrapper = ({ 
  loading, 
  children, 
  fallback, 
  type = 'spinner',
  message = 'Carregando...' 
}) => {
  if (!loading) return children;

  const loadingComponents = {
    spinner: <LoadingSpinner size="large" color="purple" />,
    page: <PageLoading message={message} />,
    card: <CardLoading message={message} />,
    skeleton: <SkeletonLoader />,
    typing: <TypingLoading message={message} />
  };

  return fallback || loadingComponents[type] || loadingComponents.spinner;
}; 