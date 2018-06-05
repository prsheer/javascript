import React, { Component } from 'react';
import RepLogs from './RepLogs';
import PropTypes from 'prop-types';
import uuid from 'uuid/v4';
import { getRepLogs, deleteRepLog, createRepLog } from '../api/rep_log_api';

export default class RepLogApp extends Component {
    constructor(props) {
        super(props);

        this.state = {
            highlightedRowId: null,
            repLogs: [],
            numberOfHearts: 1,
            isLoaded: false,
            isSavingNewRepLog: false,
            successMessage: '',
            newRepLogValidationErrorMessage: '',
            itemOptions: this.props.itemOptions
        };
        this.clearSuccessMessageTimeout = 0;

        this.handleRowClick = this.handleRowClick.bind(this);
        this.handleAddRepLog = this.handleAddRepLog.bind(this);
        this.handleHeartChange = this.handleHeartChange.bind(this);
        this.handleDeleteRepLog = this.handleDeleteRepLog.bind(this);
    }

    componentDidMount() {
        getRepLogs()
            .then((data) => {
                this.setState({
                    repLogs: data,
                    isLoaded: true
                })
            });
    }

    componentWillUnmount() {
        clearTimeout(this.clearSuccessMessageTimeout);
    }

    handleRowClick(repLogId) {
        this.setState({highlightedRowId: repLogId});
    }

    handleAddRepLog(item, quantity) {
        const newRep = {
            reps: quantity,
            item: item
        };

        this.setState({
            isSavingNewRepLog: true
        });

        const newState = {
            isSavingNewRepLog: false
        };
        createRepLog(newRep)
            .then(repLog => {
                this.setState(prevState => {
                    const newRepLogs = [...prevState.repLogs, repLog];

                    return Object.assign({
                        repLogs: newRepLogs,
                        newRepLogValidationErrorMessage: '',
                    }, newState);
                });

                this.setSuccessMessage('Rep Log Saved!');
            })
            .catch(error => {
                error.response.json().then(errorsData => {
                    const errors = errorsData.errors;
                    const firstError = errors[Object.keys(errors)[0]];

                    this.setState(Object.assign({
                        newRepLogValidationErrorMessage: firstError
                    }, newState));
                })
            })
        ;
    }

    handleHeartChange(heartCount) {
        this.setState({
            numberOfHearts: heartCount
        });
    }

    handleDeleteRepLog(id) {
        deleteRepLog(id)
            .then(() => {
                this.setSuccessMessage('Item was Un-lifted!');
            });

        // remove the rep log without mutating state
        // filter returns a new array
        this.setState((prevState) => {
            return {
                repLogs: prevState.repLogs.filter(repLog => repLog.id !== id)
            };
        });
    }

    setSuccessMessage(message) {
        this.setState({
            successMessage: message
        });

        clearTimeout(this.clearSuccessMessageTimeout);
        this.clearSuccessMessageTimeout = setTimeout(() => {
            this.setState({
                successMessage: ''
            });
            this.clearSuccessMessageTimeout = 0;
        }, 3000)
    }

    render() {
        return (
            <RepLogs
                {...this.props}
                {...this.state}
                onRowClick={this.handleRowClick}
                onAddRepLog={this.handleAddRepLog}
                onHeartChange={this.handleHeartChange}
                onDeleteRepLog={this.handleDeleteRepLog}
            />
        );
    }
}

RepLogApp.propTypes = {
    withHeart: PropTypes.bool,
    itemOptions: PropTypes.array,
};

RepLogApp.defaultProps = {
    itemOptions: []
};
