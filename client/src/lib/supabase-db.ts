import { supabase } from './supabase';
import { Car, Booking, Favorite, Message, User } from '@shared/schema';
import { PostgrestError } from '@supabase/supabase-js';

interface ConversationUser {
  id: number;
  username: string;
  profilePicture?: string;
  unreadCount: number;
  lastMessage?: string;
  lastMessageTime?: string;
}

interface MessageWithSender extends Omit<Message, 'read' | 'createdAt'> {
  sender: User;
  receiver: User;
  senderId: number;
  receiverId: number;
  read: boolean;
  content: string;
  createdAt: string;
}

interface FavoriteWithCarId {
  carId: number;
}

// Car operations
export async function fetchCars() {
  const { data, error } = await supabase
    .from('cars')
    .select('*');
  
  if (error) {
    console.error('Error fetching cars:', error);
    throw error;
  }
  
  return data as Car[];
}

export async function fetchCarById(id: number) {
  const { data, error } = await supabase
    .from('cars')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error) {
    console.error(`Error fetching car with id ${id}:`, error);
    throw error;
  }
  
  return data as Car;
}

export async function fetchCarsByHost(hostId: number) {
  const { data, error } = await supabase
    .from('cars')
    .select('*')
    .eq('hostId', hostId);
  
  if (error) {
    console.error(`Error fetching cars for host ${hostId}:`, error);
    throw error;
  }
  
  return data as Car[];
}

export async function createCar(car: Omit<Car, 'id'>) {
  const { data, error } = await supabase
    .from('cars')
    .insert([car])
    .select();
  
  if (error) {
    console.error('Error creating car:', error);
    throw error;
  }
  
  return data[0] as Car;
}

export async function updateCar(id: number, car: Partial<Car>) {
  const { data, error } = await supabase
    .from('cars')
    .update(car)
    .eq('id', id)
    .select();
  
  if (error) {
    console.error(`Error updating car with id ${id}:`, error);
    throw error;
  }
  
  return data[0] as Car;
}

// Booking operations
export async function fetchBookings(userId: number) {
  const { data, error } = await supabase
    .from('bookings')
    .select('*, car:carId(*)')
    .eq('userId', userId);
  
  if (error) {
    console.error(`Error fetching bookings for user ${userId}:`, error);
    throw error;
  }
  
  return data as (Booking & { car: Car })[];
}

export async function fetchBookingById(id: number) {
  const { data, error } = await supabase
    .from('bookings')
    .select('*, car:carId(*)')
    .eq('id', id)
    .single();
  
  if (error) {
    console.error(`Error fetching booking with id ${id}:`, error);
    throw error;
  }
  
  return data as Booking & { car: Car };
}

export async function createBooking(booking: Omit<Booking, 'id'>) {
  const { data, error } = await supabase
    .from('bookings')
    .insert([booking])
    .select();
  
  if (error) {
    console.error('Error creating booking:', error);
    throw error;
  }
  
  return data[0] as Booking;
}

export async function updateBooking(id: number, booking: Partial<Booking>) {
  const { data, error } = await supabase
    .from('bookings')
    .update(booking)
    .eq('id', id)
    .select();
  
  if (error) {
    console.error(`Error updating booking with id ${id}:`, error);
    throw error;
  }
  
  return data[0] as Booking;
}

// Favorite operations
export async function fetchFavorites(userId: number) {
  const { data, error } = await supabase
    .from('favorites')
    .select('*, car:carId(*)')
    .eq('userId', userId);
  
  if (error) {
    console.error(`Error fetching favorites for user ${userId}:`, error);
    throw error;
  }
  
  return data as (Favorite & { car: Car })[];
}

export async function fetchFavoriteIds(userId: number) {
  const { data, error } = await supabase
    .from('favorites')
    .select('carId')
    .eq('userId', userId);
  
  if (error) {
    console.error(`Error fetching favorite ids for user ${userId}:`, error);
    throw error;
  }
  
  return data.map(fav => fav.carId) as number[];
}

export async function createFavorite(favorite: Omit<Favorite, 'id'>) {
  const { data, error } = await supabase
    .from('favorites')
    .insert([favorite])
    .select();
  
  if (error) {
    console.error('Error creating favorite:', error);
    throw error;
  }
  
  return data[0] as Favorite;
}

export async function deleteFavorite(userId: number, carId: number) {
  const { error } = await supabase
    .from('favorites')
    .delete()
    .eq('userId', userId)
    .eq('carId', carId);
  
  if (error) {
    console.error(`Error deleting favorite for user ${userId} and car ${carId}:`, error);
    throw error;
  }
  
  return true;
}

// Message operations
export async function fetchConversations(userId: number) {
  // This is a more complex query that would need to be implemented
  // based on your actual database structure
  const { data, error } = await supabase
    .from('messages')
    .select('*, sender:senderId(id, username, profilePicture)')
    .or(`senderId.eq.${userId},receiverId.eq.${userId}`)
    .order('createdAt', { ascending: false });
  
  if (error) {
    console.error(`Error fetching conversations for user ${userId}:`, error);
    throw error;
  }
  
  // Process data to get unique conversations
  const conversations = (data as MessageWithSender[]).reduce((acc: Record<number, ConversationUser>, message: MessageWithSender) => {
    const otherUserId = message.senderId === userId ? message.receiverId : message.senderId;
    
    if (!acc[otherUserId]) {
      const otherUser = message.senderId === userId ? message.receiver : message.sender;
      acc[otherUserId] = {
        id: otherUser.id,
        username: otherUser.username,
        profilePicture: otherUser.profilePicture ?? undefined,
        unreadCount: message.senderId !== userId && !message.read ? 1 : 0,
        lastMessage: message.content,
        lastMessageTime: String(message.createdAt)
      };
    } else if (message.senderId !== userId && !message.read) {
      acc[otherUserId].unreadCount += 1;
    }
    
    return acc;
  }, {});
  
  return Object.values(conversations);
}

export async function fetchConversationMessages(userId: number, otherUserId: number) {
  const { data, error } = await supabase
    .from('messages')
    .select('*, sender:senderId(*)')
    .or(`and(senderId.eq.${userId},receiverId.eq.${otherUserId}),and(senderId.eq.${otherUserId},receiverId.eq.${userId})`)
    .order('createdAt', { ascending: true });
  
  if (error) {
    console.error(`Error fetching conversation messages between ${userId} and ${otherUserId}:`, error);
    throw error;
  }
  
  return data as (Message & { sender: User })[];
}

export async function createMessage(message: Omit<Message, 'id'>) {
  const { data, error } = await supabase
    .from('messages')
    .insert([message])
    .select();
  
  if (error) {
    console.error('Error creating message:', error);
    throw error;
  }
  
  return data[0] as Message;
}

export async function markConversationAsRead(userId: number, otherUserId: number) {
  const { error } = await supabase
    .from('messages')
    .update({ read: true })
    .eq('senderId', otherUserId)
    .eq('receiverId', userId)
    .eq('read', false);
  
  if (error) {
    console.error(`Error marking conversation as read between ${userId} and ${otherUserId}:`, error);
    throw error;
  }
  
  return true;
}

// User profile operations
export async function fetchUserProfile(userId: number) {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();
  
  if (error) {
    console.error(`Error fetching user profile for ${userId}:`, error);
    throw error;
  }
  
  return data as User;
}

export async function updateUserProfile(userId: number, profile: Partial<User>) {
  const { data, error } = await supabase
    .from('users')
    .update(profile)
    .eq('id', userId)
    .select();
  
  if (error) {
    console.error(`Error updating user profile for ${userId}:`, error);
    throw error;
  }
  
  return data[0] as User;
}

// File upload operations
export async function uploadProfilePicture(userId: number, file: File) {
  const fileExt = file.name.split('.').pop();
  const fileName = `${userId}-${Math.random().toString(36).substring(2)}.${fileExt}`;
  const filePath = `profile-pictures/${fileName}`;
  
  const { error: uploadError } = await supabase
    .storage
    .from('avatars')
    .upload(filePath, file);
  
  if (uploadError) {
    console.error('Error uploading profile picture:', uploadError);
    throw uploadError;
  }
  
  const { data: { publicUrl } } = supabase
    .storage
    .from('avatars')
    .getPublicUrl(filePath);
  
  return publicUrl;
}

export async function uploadCarImage(carId: number, file: File, isPrimary: boolean = false) {
  const fileExt = file.name.split('.').pop();
  const fileName = `${carId}-${isPrimary ? 'primary' : Math.random().toString(36).substring(2)}.${fileExt}`;
  const filePath = `car-images/${fileName}`;
  
  const { error: uploadError } = await supabase
    .storage
    .from('cars')
    .upload(filePath, file);
  
  if (uploadError) {
    console.error('Error uploading car image:', uploadError);
    throw uploadError;
  }
  
  const { data: { publicUrl } } = supabase
    .storage
    .from('cars')
    .getPublicUrl(filePath);
  
  return publicUrl;
}