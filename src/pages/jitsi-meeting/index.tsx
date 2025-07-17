import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Card, Input, Button, Alert, Typography } from 'antd'; // Import Ant Design components
// You may need to import CSS modules based on your project setup
// import styles from './JitsiMeeting.module.css';

declare global {
  interface Window {
    JitsiMeetExternalAPI: any;
  }
}

const JitsiMeeting: React.FC = () => {
  const jitsiContainerRef = useRef<HTMLDivElement>(null);
  const api = useRef<any>(null);
  const [roomName, setRoomName] = useState<string>('');
  const [meetingJoined, setMeetingJoined] = useState<boolean>(false);

  const loadJitsiScript = useCallback(() => {
    // Ensure JitsiMeetExternalAPI script is loaded
    if (window.JitsiMeetExternalAPI && jitsiContainerRef.current) {
      const options = {
        roomName: roomName,
        parentNode: jitsiContainerRef.current,
        configOverwrite: {
          startWithAudioMuted: false,
          startWithVideoMuted: false,
        },
        interfaceConfigOverwrite: {
          TILE_VIEW_MAX_COLUMNS: 5,
        },
        onload: () => {
          console.log('Jitsi API loaded successfully');
        }
      };

      // Using your custom Jitsi domain 'meet-tbvan.top'
      api.current = new window.JitsiMeetExternalAPI('meet-tbvan.top', options);

      api.current.addEventListener('videoConferenceJoined', () => {
        console.log('Conference joined!');
        setMeetingJoined(true);
      });

      api.current.addEventListener('participantLeft', (participant: any) => {
        console.log('Participant left:', participant);
      });

      // Clean up Jitsi instance on component unmount
      return () => {
        if (api.current) {
          api.current.dispose();
          api.current = null;
        }
      };
    }
  }, [roomName]);

  const handleJoinMeeting = () => {
    if (roomName) {
      // Before attempting to load, dispose of any previous Jitsi instances
      if (api.current) {
        api.current.dispose();
        api.current = null;
        setMeetingJoined(false); // Reset status if rejoining
      }
      loadJitsiScript();
    } else {
      alert('Please enter the meeting room name!');
    }
  };

  useEffect(() => {
    // Clean up Jitsi instance on component unmount
    return () => {
      if (api.current) {
        api.current.dispose();
      }
    };
  }, []);

  return (
    <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px' }}>
      <Typography.Title level={2} style={{ marginBottom: 0 }}>Jitsi Meeting Room</Typography.Title>

      {!meetingJoined ? (
        <Card
          style={{ 
            width: '100%', 
            maxWidth: 500, 
            textAlign: 'center',
            boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
            borderRadius: '8px'
          }}
        >
          <div style={{ marginBottom: 24 }}>
            <img
              src="jitsi-meet.jpg"
              alt="Meeting Illustration"
              style={{ width: '120px', height: '120px', objectFit: 'contain' }}
            />
          </div>
          <Typography.Title level={4} style={{ marginBottom: 24 }}>Join a Meeting</Typography.Title>
          <Input
            placeholder="Enter meeting room name"
            value={roomName}
            onChange={(e) => setRoomName(e.target.value)}
            onPressEnter={handleJoinMeeting} // Allow joining by pressing Enter
            style={{ marginBottom: 16 }}
            size="large"
          />
          <Button type="primary" onClick={handleJoinMeeting} block size="large">
            Join Meeting
          </Button>
        </Card>
      ) : (
        <Alert 
          message={`Successfully joined meeting: ${roomName}`}
          type="success" 
          showIcon 
          style={{ width: '100%', maxWidth: 700 }}
        />
      )}

      <Card 
        title={meetingJoined ? "Meeting in Progress" : "Meeting Preview"} 
        style={{ 
          width: '100%', 
          maxWidth: 1000, 
          minHeight: 400,
          boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
          borderRadius: '8px'
        }}
      >
        <div
          ref={jitsiContainerRef}
          style={{
            width: '100%',
            height: '600px',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: '#f0f2f5',
            borderRadius: '8px'
          }}
        >
          {!meetingJoined && (
            <Typography.Text type="secondary">
              The meeting will appear here once you join.
            </Typography.Text>
          )}
        </div>
      </Card>
    </div>
  );
};

export default JitsiMeeting;