import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../../firebaseConfigFront';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, serverTimestamp, query, orderBy } from 'firebase/firestore';
import { 
  FaArrowLeft, 
  FaEnvelope, 
  FaPlus, 
  FaEdit, 
  FaTrash, 
  FaEye, 
  FaPaperPlane,
  FaUsers,
  FaCalendarAlt,
  FaChartBar,
  FaFileAlt,
  FaClock
} from 'react-icons/fa';

export default function EmailsAdmin() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('campaigns');
  
  // Estados para campanhas
  const [campaigns, setCampaigns] = useState([]);
  const [showCampaignModal, setShowCampaignModal] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState(null);
  
  // Estados para templates
  const [templates, setTemplates] = useState([]);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);
  
  // Estados para régua de comunicação
  const [automationRules, setAutomationRules] = useState([]);
  const [showRuleModal, setShowRuleModal] = useState(false);
  
  // Formulários
  const [campaignForm, setCampaignForm] = useState({
    nome: '',
    assunto: '',
    template: '',
    publico: 'todos',
    agendamento: '',
    status: 'rascunho'
  });
  
  const [templateForm, setTemplateForm] = useState({
    nome: '',
    assunto: '',
    conteudo: '',
    tipo: 'promocional'
  });
  
  const [ruleForm, setRuleForm] = useState({
    nome: '',
    trigger: 'novo_usuario',
    delay: 0,
    template: '',
    ativo: true
  });

  // Dados para estatísticas
  const [emailStats, setEmailStats] = useState({
    totalEnviados: 0,
    taxaAbertura: 0,
    taxaClique: 0,
    campanhasAtivas: 0
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      await Promise.all([
        loadCampaigns(),
        loadTemplates(),
        loadAutomationRules(),
        loadEmailStats()
      ]);
      setLoading(false);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      setLoading(false);
    }
  };

  const loadCampaigns = async () => {
    try {
      const campaignsSnap = await getDocs(
        query(collection(db, 'email_campaigns'), orderBy('createdAt', 'desc'))
      );
      const campaignsData = campaignsSnap.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setCampaigns(campaignsData);
    } catch (error) {
      console.error('Erro ao carregar campanhas:', error);
    }
  };

  const loadTemplates = async () => {
    try {
      const templatesSnap = await getDocs(collection(db, 'email_templates'));
      const templatesData = templatesSnap.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setTemplates(templatesData);
    } catch (error) {
      console.error('Erro ao carregar templates:', error);
    }
  };

  const loadAutomationRules = async () => {
    try {
      const rulesSnap = await getDocs(collection(db, 'email_automation'));
      const rulesData = rulesSnap.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setAutomationRules(rulesData);
    } catch (error) {
      console.error('Erro ao carregar regras:', error);
    }
  };

  const loadEmailStats = async () => {
    // Simular estatísticas - em produção, buscar do banco/serviço de email
    setEmailStats({
      totalEnviados: 1247,
      taxaAbertura: 68.5,
      taxaClique: 12.3,
      campanhasAtivas: campaigns.filter(c => c.status === 'ativa').length
    });
  };

  const handleSaveCampaign = async () => {
    try {
      const campaignData = {
        ...campaignForm,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      if (editingCampaign) {
        await updateDoc(doc(db, 'email_campaigns', editingCampaign.id), campaignData);
      } else {
        await addDoc(collection(db, 'email_campaigns'), campaignData);
      }

      await loadCampaigns();
      setShowCampaignModal(false);
      setEditingCampaign(null);
      setCampaignForm({
        nome: '',
        assunto: '',
        template: '',
        publico: 'todos',
        agendamento: '',
        status: 'rascunho'
      });
      
      alert(editingCampaign ? 'Campanha atualizada!' : 'Campanha criada!');
    } catch (error) {
      console.error('Erro ao salvar campanha:', error);
      alert('Erro ao salvar campanha.');
    }
  };

  const handleSaveTemplate = async () => {
    try {
      const templateData = {
        ...templateForm,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      if (editingTemplate) {
        await updateDoc(doc(db, 'email_templates', editingTemplate.id), templateData);
      } else {
        await addDoc(collection(db, 'email_templates'), templateData);
      }

      await loadTemplates();
      setShowTemplateModal(false);
      setEditingTemplate(null);
      setTemplateForm({
        nome: '',
        assunto: '',
        conteudo: '',
        tipo: 'promocional'
      });
      
      alert(editingTemplate ? 'Template atualizado!' : 'Template criado!');
    } catch (error) {
      console.error('Erro ao salvar template:', error);
      alert('Erro ao salvar template.');
    }
  };

  const handleSaveRule = async () => {
    try {
      const ruleData = {
        ...ruleForm,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      await addDoc(collection(db, 'email_automation'), ruleData);
      await loadAutomationRules();
      setShowRuleModal(false);
      setRuleForm({
        nome: '',
        trigger: 'novo_usuario',
        delay: 0,
        template: '',
        ativo: true
      });
      
      alert('Regra de automação criada!');
    } catch (error) {
      console.error('Erro ao salvar regra:', error);
      alert('Erro ao salvar regra.');
    }
  };

  const handleDeleteCampaign = async (id, nome) => {
    if (window.confirm(`Deletar campanha "${nome}"?`)) {
      try {
        await deleteDoc(doc(db, 'email_campaigns', id));
        await loadCampaigns();
        alert('Campanha deletada!');
      } catch (error) {
        console.error('Erro ao deletar:', error);
        alert('Erro ao deletar campanha.');
      }
    }
  };

  const handleDeleteTemplate = async (id, nome) => {
    if (window.confirm(`Deletar template "${nome}"?`)) {
      try {
        await deleteDoc(doc(db, 'email_templates', id));
        await loadTemplates();
        alert('Template deletado!');
      } catch (error) {
        console.error('Erro ao deletar:', error);
        alert('Erro ao deletar template.');
      }
    }
  };

  const handleEditCampaign = (campaign) => {
    setEditingCampaign(campaign);
    setCampaignForm(campaign);
    setShowCampaignModal(true);
  };

  const handleEditTemplate = (template) => {
    setEditingTemplate(template);
    setTemplateForm(template);
    setShowTemplateModal(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center py-6">
            <button
              onClick={() => navigate('/admin')}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mr-4"
            >
              <FaArrowLeft />
              Voltar
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                📧 Gestão de Emails
              </h1>
              <p className="text-gray-600">
                Campanhas, templates e régua de comunicação
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <FaEnvelope className="text-blue-500 text-2xl mr-4" />
              <div>
                <p className="text-sm font-medium text-gray-600">Emails Enviados</p>
                <p className="text-2xl font-bold text-gray-900">{emailStats.totalEnviados}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <FaEye className="text-green-500 text-2xl mr-4" />
              <div>
                <p className="text-sm font-medium text-gray-600">Taxa de Abertura</p>
                <p className="text-2xl font-bold text-gray-900">{emailStats.taxaAbertura}%</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <FaChartBar className="text-orange-500 text-2xl mr-4" />
              <div>
                <p className="text-sm font-medium text-gray-600">Taxa de Clique</p>
                <p className="text-2xl font-bold text-gray-900">{emailStats.taxaClique}%</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <FaPaperPlane className="text-purple-500 text-2xl mr-4" />
              <div>
                <p className="text-sm font-medium text-gray-600">Campanhas Ativas</p>
                <p className="text-2xl font-bold text-gray-900">{emailStats.campanhasAtivas}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex">
              {[
                { id: 'campaigns', label: 'Campanhas', icon: <FaPaperPlane /> },
                { id: 'templates', label: 'Templates', icon: <FaFileAlt /> },
                { id: 'automation', label: 'Régua de Comunicação', icon: <FaClock /> }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-6 py-3 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-purple-500 text-purple-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {/* Aba Campanhas */}
            {activeTab === 'campaigns' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold text-gray-900">Campanhas de Email</h2>
                  <button
                    onClick={() => {
                      setEditingCampaign(null);
                      setCampaignForm({
                        nome: '',
                        assunto: '',
                        template: '',
                        publico: 'todos',
                        agendamento: '',
                        status: 'rascunho'
                      });
                      setShowCampaignModal(true);
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition"
                  >
                    <FaPlus />
                    Nova Campanha
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nome</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Assunto</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Público</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {campaigns.map((campaign) => (
                        <tr key={campaign.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {campaign.nome}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {campaign.assunto}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {campaign.publico === 'todos' ? 'Todos os usuários' : campaign.publico}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                              campaign.status === 'ativa' 
                                ? 'bg-green-100 text-green-800'
                                : campaign.status === 'enviada'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {campaign.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleEditCampaign(campaign)}
                                className="text-blue-600 hover:text-blue-900"
                              >
                                <FaEdit />
                              </button>
                              <button
                                onClick={() => handleDeleteCampaign(campaign.id, campaign.nome)}
                                className="text-red-600 hover:text-red-900"
                              >
                                <FaTrash />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Aba Templates */}
            {activeTab === 'templates' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold text-gray-900">Templates de Email</h2>
                  <button
                    onClick={() => {
                      setEditingTemplate(null);
                      setTemplateForm({
                        nome: '',
                        assunto: '',
                        conteudo: '',
                        tipo: 'promocional'
                      });
                      setShowTemplateModal(true);
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition"
                  >
                    <FaPlus />
                    Novo Template
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {templates.map((template) => (
                    <div key={template.id} className="bg-gray-50 rounded-lg p-4 border">
                      <div className="flex justify-between items-start mb-3">
                        <h3 className="font-medium text-gray-900">{template.nome}</h3>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          template.tipo === 'promocional'
                            ? 'bg-purple-100 text-purple-800'
                            : template.tipo === 'transacional'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {template.tipo}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">{template.assunto}</p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEditTemplate(template)}
                          className="flex-1 px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
                        >
                          <FaEdit className="inline mr-1" />
                          Editar
                        </button>
                        <button
                          onClick={() => handleDeleteTemplate(template.id, template.nome)}
                          className="px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Aba Régua de Comunicação */}
            {activeTab === 'automation' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">Régua de Comunicação</h2>
                    <p className="text-gray-600">Automatize o envio de emails baseado em triggers</p>
                  </div>
                  <button
                    onClick={() => setShowRuleModal(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition"
                  >
                    <FaPlus />
                    Nova Regra
                  </button>
                </div>

                <div className="space-y-4">
                  {automationRules.map((rule) => (
                    <div key={rule.id} className="bg-gray-50 rounded-lg p-6 border">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900 mb-2">{rule.nome}</h3>
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <span>Trigger: <strong>{rule.trigger}</strong></span>
                            <span>Delay: <strong>{rule.delay} dias</strong></span>
                            <span>Template: <strong>{rule.template}</strong></span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            rule.ativo 
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {rule.ativo ? 'Ativa' : 'Inativa'}
                          </span>
                          <button className="text-blue-600 hover:text-blue-900">
                            <FaEdit />
                          </button>
                          <button className="text-red-600 hover:text-red-900">
                            <FaTrash />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal Campanha */}
      {showCampaignModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              {editingCampaign ? 'Editar Campanha' : 'Nova Campanha'}
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
                <input
                  type="text"
                  value={campaignForm.nome}
                  onChange={(e) => setCampaignForm({ ...campaignForm, nome: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Assunto</label>
                <input
                  type="text"
                  value={campaignForm.assunto}
                  onChange={(e) => setCampaignForm({ ...campaignForm, assunto: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Template</label>
                <select
                  value={campaignForm.template}
                  onChange={(e) => setCampaignForm({ ...campaignForm, template: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                >
                  <option value="">Selecione um template</option>
                  {templates.map((template) => (
                    <option key={template.id} value={template.id}>
                      {template.nome}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Público</label>
                <select
                  value={campaignForm.publico}
                  onChange={(e) => setCampaignForm({ ...campaignForm, publico: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                >
                  <option value="todos">Todos os usuários</option>
                  <option value="ativos">Usuários ativos</option>
                  <option value="inativos">Usuários inativos</option>
                  <option value="premium">Usuários premium</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={campaignForm.status}
                  onChange={(e) => setCampaignForm({ ...campaignForm, status: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                >
                  <option value="rascunho">Rascunho</option>
                  <option value="agendada">Agendada</option>
                  <option value="ativa">Ativa</option>
                </select>
              </div>
            </div>
            
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowCampaignModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveCampaign}
                className="flex-1 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600"
              >
                Salvar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Template */}
      {showTemplateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              {editingTemplate ? 'Editar Template' : 'Novo Template'}
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
                <input
                  type="text"
                  value={templateForm.nome}
                  onChange={(e) => setTemplateForm({ ...templateForm, nome: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Assunto</label>
                <input
                  type="text"
                  value={templateForm.assunto}
                  onChange={(e) => setTemplateForm({ ...templateForm, assunto: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
                <select
                  value={templateForm.tipo}
                  onChange={(e) => setTemplateForm({ ...templateForm, tipo: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                >
                  <option value="promocional">Promocional</option>
                  <option value="transacional">Transacional</option>
                  <option value="informativo">Informativo</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Conteúdo HTML</label>
                <textarea
                  value={templateForm.conteudo}
                  onChange={(e) => setTemplateForm({ ...templateForm, conteudo: e.target.value })}
                  rows={10}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  placeholder="Cole aqui o HTML do template..."
                />
              </div>
            </div>
            
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowTemplateModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveTemplate}
                className="flex-1 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600"
              >
                Salvar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Regra Automação */}
      {showRuleModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Nova Regra de Automação</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nome da Regra</label>
                <input
                  type="text"
                  value={ruleForm.nome}
                  onChange={(e) => setRuleForm({ ...ruleForm, nome: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Trigger</label>
                <select
                  value={ruleForm.trigger}
                  onChange={(e) => setRuleForm({ ...ruleForm, trigger: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                >
                  <option value="novo_usuario">Novo usuário</option>
                  <option value="primeira_leitura">Primeira leitura de tarot</option>
                  <option value="usuario_inativo">Usuário inativo (7 dias)</option>
                                      <option value="creditos_baixos">Créditos baixos (&lt; 5)</option>
                  <option value="aniversario">Aniversário do usuário</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Delay (dias)</label>
                <input
                  type="number"
                  value={ruleForm.delay}
                  onChange={(e) => setRuleForm({ ...ruleForm, delay: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Template</label>
                <select
                  value={ruleForm.template}
                  onChange={(e) => setRuleForm({ ...ruleForm, template: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                >
                  <option value="">Selecione um template</option>
                  {templates.map((template) => (
                    <option key={template.id} value={template.id}>
                      {template.nome}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={ruleForm.ativo}
                    onChange={(e) => setRuleForm({ ...ruleForm, ativo: e.target.checked })}
                    className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                  />
                  <span className="text-sm font-medium text-gray-700">Regra ativa</span>
                </label>
              </div>
            </div>
            
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowRuleModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveRule}
                className="flex-1 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600"
              >
                Salvar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 