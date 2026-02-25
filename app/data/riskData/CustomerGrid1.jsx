'use client';
import React, { useState, useEffect } from 'react';
import { Grid, GridColumn } from '@progress/kendo-react-grid';
import CustomerData from '~/data/riskData/CustomerData.json';
import { Button } from '~/components/ui/button';
import FormDialog from '~/components/dialog';

const initialValue = { name: '', email: '', phone: '', dob: '' };
export default function CustomerGrid({ data }) {
  const [gridApi, setGridApi] = useState(null);
  const [tableData, setTableData] = useState(null);
  const [open, setOpen] = React.useState(false);
  const [formData, setFormData] = useState(initialValue);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setFormData(initialValue);
  };

  const onChange = (e) => {
    const { value, id } = e.target;
    // console.log(value,id)
    setFormData({ ...formData, [id]: value });
  };

  const handleFormSubmit = () => {
    if (formData.id) {
      //updating a user
      const confirm = window.confirm(
        'Are you sure, you want to update this row ?'
      );
      confirm &&
        fetch(url + `/${formData.id}`, {
          method: 'PUT',
          body: JSON.stringify(formData),
          headers: {
            'content-type': 'application/json'
          }
        })
          .then((resp) => resp.json())
          .then((resp) => {
            handleClose();
            getUsers();
          });
    } else {
      // adding new user
      fetch(url, {
        method: 'POST',
        body: JSON.stringify(formData),
        headers: {
          'content-type': 'application/json'
        }
      })
        .then((resp) => resp.json())
        .then((resp) => {
          handleClose();
          getUsers();
        });
    }
  };
  return (
    <div>
      <Button color="primary" onClick={handleClickOpen}>
        Add user
      </Button>
      <Grid
        data={data}
        style={{ height: '700px' }}
        rowHeight={50}
        // groupable={true}
        // size={'medium'}
        className="text-lg min-w-full"
      >
        <GridColumn
          className="text-lg"
          field="Name"
          title="Name"
          locked={true}
          filter="numeric"
        />
        <GridColumn className="text-lg" field="Type" title="Type" />
        <GridColumn className="text-lg" field="Location" title="Location" />
        <GridColumn
          className="text-lg"
          field="Include"
          title="Inclusion Type"
        />
        <GridColumn
          className="text-lg"
          field="AdditionalParameter"
          title="Additional Parameters"
        />
      </Grid>
      <FormDialog
        open={open}
        handleClose={handleClose}
        data={formData}
        onChange={onChange}
        handleFormSubmit={handleFormSubmit}
      />
    </div>
  );
}
