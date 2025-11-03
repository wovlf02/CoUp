import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import VideoCallInterface from '../VideoCallInterface';
import { useSocket } from '@/lib/hooks/useSocket';
import { useAuth } from '@/lib/hooks/useAuth';

// Mock the hooks
jest.mock('@/lib/hooks/useSocket');
jest.mock('@/lib/hooks/useAuth');

// Mock MediaDevices and MediaStream
const mockMediaStream = {
  getTracks: jest.fn(() => [{
    stop: jest.fn(),
    enabled: true,
  }]),
  getAudioTracks: jest.fn(() => [{
    stop: jest.fn(),
    enabled: true,
  }]),
  getVideoTracks: jest.fn(() => [{
    stop: jest.fn(),
    enabled: true,
  }]),
};

Object.defineProperty(global.navigator, 'mediaDevices', {
  value: {
    getUserMedia: jest.fn(() => Promise.resolve(mockMediaStream)),
  },
  writable: true,
});

// Mock RTCPeerConnection
const mockRTCPeerConnection = {
  onicecandidate: null,
  ontrack: null,
  addTrack: jest.fn(),
  createOffer: jest.fn(() => Promise.resolve({ type: 'offer', sdp: 'mock-offer' })),
  setLocalDescription: jest.fn(() => Promise.resolve()),
  setRemoteDescription: jest.fn(() => Promise.resolve()),
  createAnswer: jest.fn(() => Promise.resolve({ type: 'answer', sdp: 'mock-answer' })),
  addIceCandidate: jest.fn(() => Promise.resolve()),
  close: jest.fn(),
  currentRemoteDescription: null,
};

global.RTCPeerConnection = jest.fn(() => mockRTCPeerConnection);
global.RTCSessionDescription = jest.fn((desc) => desc);
global.RTCIceCandidate = jest.fn((candidate) => candidate);

describe('VideoCallInterface', () => {
  const mockSocketEmit = jest.fn();
  const mockSocketOn = jest.fn();
  const mockSocketOff = jest.fn();
  const mockUser = { id: 'user-1', name: 'Test User' };
  const studyId = 'study-1';

  beforeEach(() => {
    jest.clearAllMocks();
    useSocket.mockReturnValue({
      emit: mockSocketEmit,
      on: mockSocketOn,
      off: mockSocketOff,
    });
    useAuth.mockReturnValue({ user: mockUser });

    // Reset mock for each test
    mockRTCPeerConnection.addTrack.mockClear();
    mockRTCPeerConnection.createOffer.mockClear();
    mockRTCPeerConnection.setLocalDescription.mockClear();
    mockRTCPeerConnection.setRemoteDescription.mockClear();
    mockRTCPeerConnection.createAnswer.mockClear();
    mockRTCPeerConnection.addIceCandidate.mockClear();
    mockRTCPeerConnection.close.mockClear();
    mockRTCPeerConnection.currentRemoteDescription = null;

    global.navigator.mediaDevices.getUserMedia.mockClear();
    mockMediaStream.getTracks.mockClear();
    mockMediaStream.getAudioTracks.mockClear();
    mockMediaStream.getVideoTracks.mockClear();
  });

  it('renders correctly and requests media access', async () => {
    render(<VideoCallInterface studyId={studyId} />);

    expect(screen.getByText('참여자 목록')).toBeInTheDocument();
    expect(global.navigator.mediaDevices.getUserMedia).toHaveBeenCalledWith({
      video: true,
      audio: true,
    });
    await waitFor(() => expect(mockSocketEmit).toHaveBeenCalledWith('join_video_call', { studyId, userId: mockUser.id }));
  });

  it('toggles microphone on and off', async () => {
    render(<VideoCallInterface studyId={studyId} />);
    await waitFor(() => expect(global.navigator.mediaDevices.getUserMedia).toHaveBeenCalled());

    const micButton = screen.getByRole('button', { name: /마이크/i });
    fireEvent.click(micButton);
    expect(mockMediaStream.getAudioTracks()[0].enabled).toBe(false);
    expect(mockSocketEmit).toHaveBeenCalledWith('toggle_mic', { studyId, userId: mockUser.id, isMicOn: false });

    fireEvent.click(micButton);
    expect(mockMediaStream.getAudioTracks()[0].enabled).toBe(true);
    expect(mockSocketEmit).toHaveBeenCalledWith('toggle_mic', { studyId, userId: mockUser.id, isMicOn: true });
  });

  it('toggles camera on and off', async () => {
    render(<VideoCallInterface studyId={studyId} />);
    await waitFor(() => expect(global.navigator.mediaDevices.getUserMedia).toHaveBeenCalled());

    const cameraButton = screen.getByRole('button', { name: /카메라/i });
    fireEvent.click(cameraButton);
    expect(mockMediaStream.getVideoTracks()[0].enabled).toBe(false);
    expect(mockSocketEmit).toHaveBeenCalledWith('toggle_camera', { studyId, userId: mockUser.id, isCameraOn: false });

    fireEvent.click(cameraButton);
    expect(mockMediaStream.getVideoTracks()[0].enabled).toBe(true);
    expect(mockSocketEmit).toHaveBeenCalledWith('toggle_camera', { studyId, userId: mockUser.id, isCameraOn: true });
  });

  it('handles participant updates and peer connection setup', async () => {
    render(<VideoCallInterface studyId={studyId} />);
    await waitFor(() => expect(mockSocketEmit).toHaveBeenCalledWith('join_video_call', expect.any(Object)));

    const participantsUpdateCallback = mockSocketOn.mock.calls.find(call => call[0] === 'participants_update')[1];
    const newParticipant = { id: 'user-2', name: 'Another User' };
    participantsUpdateCallback([mockUser, newParticipant]);

    await waitFor(() => {
      expect(global.RTCPeerConnection).toHaveBeenCalledTimes(1);
      expect(mockRTCPeerConnection.addTrack).toHaveBeenCalledTimes(mockMediaStream.getTracks().length);
      expect(mockRTCPeerConnection.createOffer).toHaveBeenCalledTimes(1);
      expect(mockRTCPeerConnection.setLocalDescription).toHaveBeenCalledTimes(1);
      expect(mockSocketEmit).toHaveBeenCalledWith('webrtc_offer', {
        targetUserId: newParticipant.id,
        offer: { type: 'offer', sdp: 'mock-offer' },
        studyId,
      });
    });
  });

  it('handles receiving a WebRTC offer', async () => {
    render(<VideoCallInterface studyId={studyId} />);
    await waitFor(() => expect(mockSocketEmit).toHaveBeenCalledWith('join_video_call', expect.any(Object)));

    const webrtcOfferCallback = mockSocketOn.mock.calls.find(call => call[0] === 'webrtc_offer')[1];
    const senderUserId = 'user-3';
    const offer = { type: 'offer', sdp: 'remote-offer' };

    await webrtcOfferCallback({ senderUserId, offer, studyId });

    await waitFor(() => {
      expect(global.RTCPeerConnection).toHaveBeenCalledTimes(1);
      expect(mockRTCPeerConnection.setRemoteDescription).toHaveBeenCalledWith(offer);
      expect(mockRTCPeerConnection.createAnswer).toHaveBeenCalledTimes(1);
      expect(mockRTCPeerConnection.setLocalDescription).toHaveBeenCalledTimes(2); // Once for offer, once for answer
      expect(mockSocketEmit).toHaveBeenCalledWith('webrtc_answer', {
        targetUserId: senderUserId,
        answer: { type: 'answer', sdp: 'mock-answer' },
        studyId,
      });
    });
  });

  it('handles receiving a WebRTC answer', async () => {
    render(<VideoCallInterface studyId={studyId} />);
    await waitFor(() => expect(mockSocketEmit).toHaveBeenCalledWith('join_video_call', expect.any(Object)));

    // Simulate a peer connection already existing (e.g., from an offer we sent)
    const newParticipant = { id: 'user-2', name: 'Another User' };
    const participantsUpdateCallback = mockSocketOn.mock.calls.find(call => call[0] === 'participants_update')[1];
    participantsUpdateCallback([mockUser, newParticipant]);
    await waitFor(() => expect(mockRTCPeerConnection.createOffer).toHaveBeenCalled());

    const webrtcAnswerCallback = mockSocketOn.mock.calls.find(call => call[0] === 'webrtc_answer')[1];
    const senderUserId = newParticipant.id;
    const answer = { type: 'answer', sdp: 'remote-answer' };

    await webrtcAnswerCallback({ senderUserId, answer, studyId });

    await waitFor(() => {
      expect(mockRTCPeerConnection.setRemoteDescription).toHaveBeenCalledWith(answer);
    });
  });

  it('handles receiving an ICE candidate', async () => {
    render(<VideoCallInterface studyId={studyId} />);
    await waitFor(() => expect(mockSocketEmit).toHaveBeenCalledWith('join_video_call', expect.any(Object)));

    // Simulate a peer connection already existing
    const newParticipant = { id: 'user-2', name: 'Another User' };
    const participantsUpdateCallback = mockSocketOn.mock.calls.find(call => call[0] === 'participants_update')[1];
    participantsUpdateCallback([mockUser, newParticipant]);
    await waitFor(() => expect(mockRTCPeerConnection.createOffer).toHaveBeenCalled());

    const webrtcIceCandidateCallback = mockSocketOn.mock.calls.find(call => call[0] === 'webrtc_ice_candidate')[1];
    const senderUserId = newParticipant.id;
    const candidate = { candidate: 'mock-candidate', sdpMid: '0', sdpMLineIndex: 0 };

    await webrtcIceCandidateCallback({ senderUserId, candidate, studyId });

    await waitFor(() => {
      expect(mockRTCPeerConnection.addIceCandidate).toHaveBeenCalledWith(candidate);
    });
  });

  it('cleans up on unmount', async () => {
    const { unmount } = render(<VideoCallInterface studyId={studyId} />);
    await waitFor(() => expect(mockSocketEmit).toHaveBeenCalledWith('join_video_call', expect.any(Object)));

    unmount();

    expect(mockSocketEmit).toHaveBeenCalledWith('leave_video_call', { studyId, userId: mockUser.id });
    expect(mockSocketOff).toHaveBeenCalledWith('participants_update');
    expect(mockSocketOff).toHaveBeenCalledWith('webrtc_offer');
    expect(mockSocketOff).toHaveBeenCalledWith('webrtc_answer');
    expect(mockSocketOff).toHaveBeenCalledWith('webrtc_ice_candidate');
    expect(mockMediaStream.getTracks()[0].stop).toHaveBeenCalled();
    expect(mockRTCPeerConnection.close).toHaveBeenCalled();
  });
});
