import React, { useEffect, useState } from 'react';
import axios from 'axios';
import FormList from './components/FormList';
import FieldList from './components/FieldList';
import type { Form, GraphData, PrefillConfigs, GraphNode, GraphEdge, JourneyNodeInfo } from './types';
import { mapGraphDataToAppForms } from './utils/graphUtils';
import './App.css';

const App: React.FC = () => {
  // State for all parsed form definitions (templates)
  const [formDefinitions, setFormDefinitions] = useState<Form[]>([]);

  // State for the list of journey nodes to display in FormList
  const [journeyNodesForDisplay, setJourneyNodesForDisplay] = useState<JourneyNodeInfo[]>([]);

  // State for graph structure - dependency calculations
  const [graphNodes, setGraphNodes] = useState<GraphNode[]>([]);
  const [graphEdges, setGraphEdges] = useState<GraphEdge[]>([]);

  // State for the currently selected form definition to show fields for
  const [selectedFormDefinition, setSelectedFormDefinition] = useState<Form | null>(null);

  // State to keep track of which journey node was selected
  const [selectedJourneyNodeId, setSelectedJourneyNodeId] = useState<string | null>(null);


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

        // 1. Process and store all form definitions/templates
        const allDefs = mapGraphDataToAppForms(graphData.forms);
        setFormDefinitions(allDefs);

        // 2. Process graph nodes for display in FormList
        const nodesForList: JourneyNodeInfo[] = graphData.nodes.map(node => ({
          id: node.id, // Use the graph node's unique ID (e.g., "form-xyz-123")
          name: node.data.name, // Display name like "Form A"
          formDefinitionId: node.data.component_id, // ID of the form definition it uses
        }));
        setJourneyNodesForDisplay(nodesForList);

        // 3. Store graph structure
        setGraphNodes(graphData.nodes);
        setGraphEdges(graphData.edges);

      } catch (err: any) {
        console.error('Error fetching forms:', err);
        let errorMessage = 'Failed to load form data. Please ensure the mock server is running.';
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    fetchGraphData();
  }, []);

  // Handler for when a journey node is selected from FormList
  const handleSelectJourneyNode = (selectedNodeInfo: JourneyNodeInfo) => {
    const definition = formDefinitions.find(def => def.id === selectedNodeInfo.formDefinitionId);
    if (definition) {
      setSelectedFormDefinition(definition);
      setSelectedJourneyNodeId(selectedNodeInfo.id); // Keep track of the selected journey node's ID
    } else {
      setSelectedFormDefinition(null);
      setSelectedJourneyNodeId(null);
      console.error(`Form definition not found for ID: ${selectedNodeInfo.formDefinitionId}`);
      setError(`Could not load details for ${selectedNodeInfo.name}. Definition missing.`);
    }
  };

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

  if (isLoading) return <div className="loading-container">Loading forms...</div>;
  if (error) return <div className="error-container">Error: {error}</div>;

  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      <div style={{ width: '25%', minWidth: '250px', borderRight: '1px solid #ccc', padding: '1rem', overflowY: 'auto', backgroundColor: '#f9f9f9' }}>
        <FormList
          journeyNodes={journeyNodesForDisplay}
          onSelectJourneyNode={handleSelectJourneyNode}
          selectedJourneyNodeId={selectedJourneyNodeId}
        />
      </div>
      <div style={{ width: '75%', padding: '1rem', overflowY: 'auto' }}>
        {selectedFormDefinition && selectedJourneyNodeId ? (
          <FieldList
            form={selectedFormDefinition}
            selectedJourneyNodeId={selectedJourneyNodeId}
            allForms={formDefinitions}
            nodes={graphNodes}
            edges={graphEdges}
            prefillConfigs={prefillConfigs[selectedFormDefinition.id] || {}}
            onUpdatePrefill={handleUpdatePrefill}
          />
        ) : (
          <p>Select a form from the list to see its fields and configure prefill options.</p>
        )}
      </div>
    </div>
  );
};

export default App;
