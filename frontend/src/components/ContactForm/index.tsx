import React, { useState } from 'react';
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormControl from "@mui/material/FormControl";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";

interface ContactFormProps {
  onSubmit: (formData: ContactFormData) => void;
}

export interface ContactFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  reason: string;
  message: string;
}

export default function ContactForm({ onSubmit }: ContactFormProps) {
  const [formData, setFormData] = useState<ContactFormData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    reason: 'feedback',
    message: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    onSubmit(formData);
  };

  return (
    <Paper sx={{ width: '100%', maxWidth: '100%', bgcolor: '#F0F8FE', boxShadow: 'none' }}>
      <Box sx={{ 
        bgcolor: '#0070ed', 
        color: 'white', 
        p: 1.5, 
        textAlign: 'center',
        mb: 2
      }}>
        <Typography variant="h6">
          Contact Us
        </Typography>
      </Box>
      
      <Box sx={{ p: 2 }}>
        <Typography variant="body2" gutterBottom>
          Contact us to provide user feedback or receive technical support.
        </Typography>
        
        <form onSubmit={handleSubmit}>
          <Stack spacing={2}>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Box sx={{ flex: 1 }}>
                <Typography variant="body2" gutterBottom>First Name</Typography>
                <TextField
                  fullWidth
                  size="small"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  sx={{ bgcolor: '#FFFFFF' }}
                  variant="outlined"
                  inputProps={{ style: { height: '14px' } }}
                />
              </Box>
              <Box sx={{ flex: 1 }}>
                <Typography variant="body2" gutterBottom>Last Name</Typography>
                <TextField
                  fullWidth
                  size="small"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  sx={{ bgcolor: '#FFFFFF' }}
                  variant="outlined"
                  inputProps={{ style: { height: '14px' } }}
                />
              </Box>
            </Box>
            
            <Box>
              <Typography variant="body2" gutterBottom>Email Address</Typography>
              <TextField
                fullWidth
                size="small"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                sx={{ bgcolor: '#FFFFFF' }}
                variant="outlined"
                inputProps={{ style: { height: '14px' } }}
              />
            </Box>
            
            <Box>
              <Typography variant="body2" gutterBottom>Phone Number</Typography>
              <TextField
                fullWidth
                size="small"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                sx={{ bgcolor: '#FFFFFF' }}
                variant="outlined"
                inputProps={{ style: { height: '14px' } }}
              />
            </Box>
            
            <Box>
              <Typography variant="body2" gutterBottom>Reason:</Typography>
              <FormControl component="fieldset">
                <RadioGroup
                  name="reason"
                  value={formData.reason}
                  onChange={handleInputChange}
                  sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1 }}
                >
                  <FormControlLabel value="feedback" control={<Radio size="small" />} label="Provide Site Feedback" />
                  <FormControlLabel value="inaccurate" control={<Radio size="small" />} label="Report Inaccurate Data" />
                  <FormControlLabel value="technical" control={<Radio size="small" />} label="Report a Technical Issue" />
                  <FormControlLabel value="report" control={<Radio size="small" />} label="Request a Report" />
                  <FormControlLabel value="other" control={<Radio size="small" />} label="Other" />
                </RadioGroup>
              </FormControl>
            </Box>
            
            <Box>
              <Typography variant="body2" gutterBottom>Message</Typography>
              <TextField
                fullWidth
                multiline
                rows={4}
                name="message"
                placeholder="Enter your comments or questions here."
                value={formData.message}
                onChange={handleInputChange}
                sx={{ bgcolor: '#FFFFFF' }}
                variant="outlined"
              />
            </Box>
            
            <Button
              type="submit"
              variant="contained"
              fullWidth
              sx={{ mt: 1 }}
            >
              Submit
            </Button>
          </Stack>
        </form>
      </Box>
    </Paper>
  );
} 