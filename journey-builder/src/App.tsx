import React, { useEffect, useState } from 'react';
import axios from 'axios';
import FormList from './components/FormList';
import FieldList from './components/FieldList';
import type { Form, GraphData, PrefillConfigs, GraphNode, GraphEdge } from './types';
import { mapGraphDataToAppForms } from './utils/graphUtils';
import './App.css';

const App: React.FC = () => {
  const [allForms, setAllForms] = useState<Form[]>([]);
  const [nodes, setNodes] = useState<GraphNode[]>([]);
  const [edges, setEdges] = useState<GraphEdge[]>([]);
  const [selectedForm, setSelectedForm] = useState<Form | null>(null);
  const [prefillConfigs, setPrefillConfigs] = useState<PrefillConfigs>({});
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchGraphData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const apiUrl = 'http://localhost:3000/api/v1/default/actions/blueprints/default/graph';
        const response = await axios.get<GraphData>(apiUrl);
        const graphData = response.data;

        const appForms = mapGraphDataToAppForms(graphData.forms);
        setAllForms(appForms);
        setNodes(graphData.nodes);
        setEdges(graphData.edges);

      } catch (err: any) {
        console.error('Error fetching forms:', err);
        let errorMessage = 'Failed to load form data. Please ensure the mock server (misc/frontendchallengeserver/index.js) is running on port 3000.';
        if (axios.isAxiosError(err)) {
          if (err.response) {
            errorMessage += ` Server responded with status: ${err.response.status}.`;
          } else if (err.request) {
            errorMessage += ' No response received from server. Is it running and accessible?';
          } else {
            errorMessage += ` Error message: ${err.message}.`;
          }
        }
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    fetchGraphData();
  }, []);

  const handleUpdatePrefill = (
    targetFormId: string,
    targetFieldId: string,
    config: { sourceFieldId: string; sourceFieldName: string; sourceType: 'direct' | 'transitive' | 'global' } | null
  ) => {
    setPrefillConfigs(prev => ({
      ...prev,
      [targetFormId]: {
        ...prev[targetFormId],
        [targetFieldId]: config ? {
          formId: targetFormId,
          fieldId: targetFieldId,
          sourceFieldId: config.sourceFieldId,
          sourceFieldName: config.sourceFieldName,
          sourceType: config.sourceType,
        } : null,
      },
    }));
  };

  const appContainerStyle: React.CSSProperties = {
    display: 'flex',
    height: '100vh',
    fontFamily: 'Arial, sans-serif',
    backgroundColor: '#f0f2f5'
  };

  const formListWrapperStyle: React.CSSProperties = {
    width: '25%',
    minWidth: '250px',
    flexShrink: 0,
    borderRight: '1px solid #d1d5db',
    overflowY: 'auto',
    backgroundColor: '#f8f9fa',
  };

  const fieldListWrapperStyle: React.CSSProperties = {
    width: '75%',
    flexGrow: 1,
    padding: '1rem',
    overflowY: 'auto',
    backgroundColor: '#ffffff'
  };

  if (isLoading) return <div className="loading-container">Loading forms...</div>;
  if (error) return <div className="error-container">Error: {error}</div>;

  return (
    <div style={appContainerStyle}>
      <div style={formListWrapperStyle}>
        <FormList forms={allForms} onSelectForm={setSelectedForm} selectedFormId={selectedForm?.id} />
      </div>
      <div style={fieldListWrapperStyle}>
        {selectedForm ? (
          <FieldList
            form={selectedForm}
            allForms={allForms}
            nodes={nodes}
            edges={edges}
            prefillConfigs={prefillConfigs[selectedForm.id] || {}}
            onUpdatePrefill={handleUpdatePrefill}
          />
        ) : (
          <p className="placeholder-text">Select a form from the list to see its fields and configure prefill options.</p>
        )}
      </div>
    </div>
  );
};

export default App;
