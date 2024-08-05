'use client'

import { useState, useEffect, useMemo, useRef } from 'react'

import AddAPhotoIcon from '@mui/icons-material/AddAPhoto'
import { Box, Stack, Typography, Button, Modal, TextField, Switch, ThemeProvider, createTheme, CssBaseline, IconButton } from '@mui/material'
import { firestore } from '@/firebase'
import {
  collection,
  doc,
  getDocs,
  query,
  setDoc,
  deleteDoc,
  getDoc,
} from 'firebase/firestore'

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
  display: 'flex',
  flexDirection: 'column',
  gap: 3,
}

export default function Home() {

  const [inventory, setInventory] = useState([])
  const [open, setOpen] = useState(false)
  const [itemName, setItemName] = useState('')
  const [darkMode, setDarkMode] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  const fileInputRef = useRef(null)

  const theme = createTheme({
    palette: {
      mode: darkMode ? 'dark' : 'light',
    },
  })  

  const updateInventory = async () => {
    const snapshot = query(collection(firestore, 'inventory'))
    const docs = await getDocs(snapshot)
    const inventoryList = []
    docs.forEach((doc) => {
      inventoryList.push({ name: doc.id, ...doc.data() })
    })
    setInventory(inventoryList)
  }
  
  useEffect(() => {
    updateInventory()
  }, [])

  const filteredInventory = useMemo(() => {
    return inventory.filter((item) => item.name.toLowerCase().includes(searchTerm.toLowerCase()))
  }, [inventory, searchTerm])
  
  const addItem = async (item) => {
    const docRef = doc(collection(firestore, 'inventory'), item)
    const docSnap = await getDoc(docRef)
    if (docSnap.exists()) {
      const { quantity } = docSnap.data()
      await setDoc(docRef, { quantity: quantity + 1 })
    } else {
      await setDoc(docRef, { quantity: 1 })
    }
    await updateInventory()
  }
  
  const removeItem = async (item) => {
    const docRef = doc(collection(firestore, 'inventory'), item)
    await deleteDoc(docRef)
    await updateInventory()
  }

  const updateItemQuantity = async (item, newQuantity) => {
    const parsedQuantity = parseInt(newQuantity, 10);
    // Update client-side state immediately
    setInventory(prevInventory =>
      prevInventory.map(invItem =>
        invItem.name === item ? { ...invItem, quantity: parsedQuantity } : invItem
      )
    );

    // Debounced server update
    debouncedUpdateServer(item, parsedQuantity);
  }

  const debouncedUpdateServer = useMemo(
    () => debounce(async (item, quantity) => {
      const docRef = doc(collection(firestore, 'inventory'), item);
      await setDoc(docRef, { quantity });
    }, 500),
    []
  );
  
  const handleOpen = () => setOpen(true)
  const handleClose = () => setOpen(false)

  const handleImageClick = (name) => {
    fileInputRef.current.click()
    fileInputRef.current.setAttribute('data-item', name);
  }

  const handleImageChange = async (event) => {
    const file = event.target.files[0];
    const itemName = event.target.getAttribute('data-item');
    if (file && itemName) {
      // Here you would typically upload the file to your storage service
      // and get back a URL. For this example, we'll use a fake URL.
      const imageUrl = URL.createObjectURL(file);
      
      // Update Firestore with the new image URL
      const docRef = doc(collection(firestore, 'inventory'), itemName);
      await setDoc(docRef, { imageUrl }, { merge: true });
      
      // Update local state
      setInventory(prevInventory =>
        prevInventory.map(item =>
          item.name === itemName ? { ...item, imageUrl } : item
        )
      );
    }
  };

  return (
    <ThemeProvider theme={theme}>
    <CssBaseline />
    <Box
      width="100vw"
      height="100vh"
      display={'flex'}
      justifyContent={'center'}
      flexDirection={'column'}
      alignItems={'center'}
      gap={2}
    >
      <Box
        position="absolute"
        top={16}
        right={16}
      >
        <Switch checked={darkMode} onChange={() => setDarkMode(!darkMode)} color="primary" />
      </Box>
      
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <Typography id="modal-modal-title" variant="h6" component="h2">
            Add Item
          </Typography>
          <Stack width="100%" direction={'row'} spacing={2}>
            <TextField
              id="outlined-basic"
              label="Item"
              variant="outlined"
              fullWidth
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
            />
            <Button
              variant="outlined"
              onClick={() => {
                addItem(itemName)
                setItemName('')
                handleClose()
              }}
            >
              Add
            </Button>
          </Stack>
        </Box>
      </Modal>
      <Typography variant="h4" gutterBottom>
        Your Pantry
      </Typography>
      <TextField
        label="Search"
        variant="outlined"
        fullWidth
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        style={{ marginBottom: '20px', maxWidth: '800px' }}
      />
      <Box border={'1px solid #333'}>
        <Box
          width="800px"
          bgcolor={'primary.main'}
          display={'flex'}
          alignItems={'center'}
          padding={2}
          position="relative"
        >
          <Typography variant={'h6'} color={'#333'} width="33%">
            Image
          </Typography>
          <Typography variant={'h6'} color={'#333'} width="33%">
            Item
          </Typography>
          <Typography variant={'h6'} color={'#333'} width="33%">
            Quantity
          </Typography>
          <Button
            variant="contained"
            onClick={handleOpen}
            sx={{
              position: 'absolute',
              fontSize: '24px',
              right: '16px',
              top: '50%',
              transform: 'translateY(-50%)',
              minWidth: '40px',
              padding: '0px',
             }}
          >
            +
          </Button>
        </Box>
        <Stack width="800px" height="300px" spacing={2} overflow={'auto'}>
          {filteredInventory.map(({name, quantity}) => (
            <Box
              key={name}
              width="100%"
              minHeight="50px"
              display={'flex'}
              alignItems={'center'}
              bgcolor={'background.paper'}
              padding={2}
            >
              <Box width="33%">
                <IconButton 
                  color="primary"
                  aria-label="upload picture"
                  component="span"
                  onClick={(e) => handleImageClick(name)}
                >
                  <AddAPhotoIcon />
                </IconButton>
              </Box>
              <Typography variant={'body1'} width="33%">
                {name.charAt(0).toUpperCase() + name.slice(1)}
              </Typography>
              <Box width="33%" display="flex" justifyContent="space-between" alignItems="center">
                <TextField
                  type="number"
                  value={quantity}
                  onChange={(e) => updateItemQuantity(name, e.target.value)}
                  inputProps={{ min: 0 }}
                  style={{ width: '50%' }}
                />
                <Button
                  variant="text"
                  onClick={() => removeItem(name)}
                  sx={{
                    fontSize: '18px',
                    right: '-3px',
                    minWidth: '30px',
                    padding: '0px',
                  }}
                >
                  X
                </Button>
              </Box>
            </Box>
          ))}
        </Stack>
      </Box>
    </Box>
    </ThemeProvider>
  )
}

function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}