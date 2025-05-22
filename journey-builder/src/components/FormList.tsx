import React from 'react';
import type { Form } from '../types';
import './FormList.css';

interface FormListProps {
    forms: Form[];
    onSelectForm: (form: Form) => void;
    selectedFormId?: string | null;
}

const FormList: React.FC<FormListProps> = ({ forms, onSelectForm, selectedFormId }) => (
    <div className="form-list-container">
        <h2 className="form-list-title">Forms</h2>
        {forms.length === 0 && <p className="form-list-empty">No forms loaded.</p>}
        <ul className="form-list-ul">
            {forms.map((form, index) => (
                <li key={form.id} className="form-list-item-wrapper">
                    <button
                        onClick={() => onSelectForm(form)}
                        className={`form-list-item-button ${selectedFormId === form.id ? 'selected' : ''}`}
                        title={`Select form: ${form.name}`}
                    >
                        <span className="form-item-index">{index + 1}.</span>
                        <span className="form-name-text">{form.name}</span>
                    </button>
                </li>
            ))}
        </ul>
    </div>
);

export default FormList;
